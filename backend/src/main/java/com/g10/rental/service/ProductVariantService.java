package com.g10.rental.service;

import com.g10.rental.dto.product.CreateProductVariantRequest;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingItem;
import com.g10.rental.entity.Product;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.exception.ProductNotFoundException;
import com.g10.rental.repository.BookingItemRepository;
import com.g10.rental.repository.CartItemRepository;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final BookingItemRepository bookingItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;

    public List<ProductVariant> getVariants(Long productId, String search) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(productId);

        if (search == null || search.isBlank()) {
            return variants;
        }

        String keyword = search.toLowerCase();
        return variants.stream()
                .filter(v -> (v.getSku() != null && v.getSku().toLowerCase().contains(keyword))
                        || (v.getSize() != null && v.getSize().toLowerCase().contains(keyword))
                        || (v.getColor() != null && v.getColor().toLowerCase().contains(keyword)))
                .toList();
    }

    public ProductVariant getVariant(Long productId, Long variantId) {
        return findVariant(productId, variantId);
    }

    @Transactional
    public ProductVariant createVariant(Long productId, CreateProductVariantRequest request) {
        Product product = findProduct(productId);
        ProductVariant variant = ProductVariant.builder()
                .productId(productId)
                .sku(ProductService.generateSku())
                .build();
        applyFields(variant, request);
        ProductVariant saved = productVariantRepository.save(variant);
        productService.syncStock(product);
        return saved;
    }

    @Transactional
    public ProductVariant updateVariant(Long productId, Long variantId, CreateProductVariantRequest request) {
        Product product = findProduct(productId);
        ProductVariant variant = findVariant(productId, variantId);
        applyFields(variant, request);
        ProductVariant saved = productVariantRepository.save(variant);
        productService.syncStock(product);
        return saved;
    }

    @Transactional
    public void deleteVariant(Long productId, Long variantId) {
        Product product = findProduct(productId);
        ProductVariant variant = findVariant(productId, variantId);

        if (productVariantRepository.findByProductId(productId).size() <= 1) {
            throw new IllegalArgumentException("ต้องมีไซซ์/สีอย่างน้อย 1 แบบ ถ้าไม่ใช้สินค้านี้แล้วให้ลบสินค้าแทน");
        }

        List<String> activeBookingCodes = bookingItemRepository.findByVariantId(variantId).stream()
                .map(BookingItem::getBooking)
                .filter(b -> ProductService.ACTIVE_BOOKING_STATUSES.contains(b.getStatus()))
                .map(Booking::getCode)
                .distinct()
                .toList();
        if (!activeBookingCodes.isEmpty()) {
            throw new IllegalArgumentException("ลบไซซ์/สีนี้ไม่ได้ เพราะยังมีการจองที่ยังไม่จบ: "
                    + String.join(", ", activeBookingCodes));
        }

        cartItemRepository.deleteAllByVariantIds(List.of(variantId));
        productVariantRepository.delete(variant);
        productVariantRepository.flush();
        productService.syncStock(product);
    }

    private static void applyFields(ProductVariant variant, CreateProductVariantRequest request) {
        variant.setSize(blankToDefault(request.getSize(), "Free Size"));
        variant.setColor(blankToDefault(request.getColor(), "-"));
        variant.setStockQty(request.getStockQty());
        variant.setPrice3Day(request.getPrice3Day());
        variant.setPrice5Day(request.getPrice5Day());
        variant.setPrice7Day(request.getPrice7Day());
        variant.setExtraDayPrice(request.getExtraDayPrice());
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
    }

    private ProductVariant findVariant(Long productId, Long variantId) {
        return productVariantRepository.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบไซซ์/สีนี้ของสินค้า"));
    }
}
