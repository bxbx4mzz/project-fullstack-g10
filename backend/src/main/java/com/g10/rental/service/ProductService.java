package com.g10.rental.service;

import com.g10.rental.exception.ProductNotFoundException;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingItem;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.Product;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.BookingItemRepository;
import com.g10.rental.repository.CartItemRepository;
import com.g10.rental.repository.FavoriteRepository;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.ProductVariantRepository;
import com.g10.rental.dto.product.CreateProductRequest;
import com.g10.rental.dto.product.CreateProductVariantRequest;
import com.g10.rental.dto.product.ProductResponse;
import com.g10.rental.dto.product.UpdateProductRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final BookingItemRepository bookingItemRepository;
    private final CartItemRepository cartItemRepository;
    private final FavoriteRepository favoriteRepository;

    static final Set<BookingStatus> ACTIVE_BOOKING_STATUSES =
            EnumSet.of(BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.SHIPPED);

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ProductResponse getProductById(Long id) {
        return toResponse(getProductEntityById(id));
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        applyImages(product, request.getImageUrls(), request.getImageUrl());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());

        Product savedProduct = productRepository.save(product);

        if (request.getVariants() != null) {
            for (CreateProductVariantRequest variantRequest : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .productId(savedProduct.getId())
                        .sku(generateSku())
                        .size(variantRequest.getSize())
                        .color(variantRequest.getColor())
                        .stockQty(variantRequest.getStockQty())
                        .price3Day(variantRequest.getPrice3Day())
                        .price5Day(variantRequest.getPrice5Day())
                        .price7Day(variantRequest.getPrice7Day())
                        .extraDayPrice(variantRequest.getExtraDayPrice())
                        .build();
                productVariantRepository.save(variant);
            }
        }

        syncStock(savedProduct);
        return toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = getProductEntityById(id);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        applyImages(product, request.imageUrls(), request.imageUrl());
        product.setCategory(request.category());
        product.setStock(request.stock());
        syncStock(product);

        return toResponse(productRepository.save(product));
    }

    // First image is the cover; with no images the fallback icon (emoji or single URL) is kept as-is.
    private static void applyImages(Product product, List<String> imageUrls, String fallbackIcon) {
        List<String> images = imageUrls == null ? List.of() : imageUrls.stream().map(String::trim).filter(u -> !u.isEmpty()).toList();
        product.getImageUrls().clear();
        product.getImageUrls().addAll(images);
        product.setImageUrl(images.isEmpty() ? fallbackIcon : images.get(0));
    }

    // When a product has sizes/colors, its total stock is always the sum of theirs.
    @Transactional
    public void syncStock(Product product) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        if (!variants.isEmpty()) {
            product.setStock(variants.stream().mapToInt(v -> v.getStockQty() == null ? 0 : v.getStockQty()).sum());
            productRepository.save(product);
        }
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found with id: " + id);
        }

        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        List<Long> variantIds = variants.stream().map(ProductVariant::getId).toList();

        List<String> activeBookingCodes = variantIds.stream()
                .flatMap(variantId -> bookingItemRepository.findByVariantId(variantId).stream())
                .map(BookingItem::getBooking)
                .filter(b -> ACTIVE_BOOKING_STATUSES.contains(b.getStatus()))
                .map(Booking::getCode)
                .distinct()
                .toList();
        if (!activeBookingCodes.isEmpty()) {
            throw new IllegalArgumentException("ลบสินค้านี้ไม่ได้ เพราะยังมีการจองที่ยังไม่จบ: "
                    + String.join(", ", activeBookingCodes));
        }

        if (!variantIds.isEmpty()) {
            cartItemRepository.deleteAllByVariantIds(variantIds);
        }
        favoriteRepository.deleteAllByProductId(id);
        productVariantRepository.deleteAll(variants);
        productRepository.deleteById(id);
    }

    private Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                List.copyOf(product.getImageUrls()),
                product.getCategory(),
                product.getStock(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }

    static String generateSku() {
        return "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
