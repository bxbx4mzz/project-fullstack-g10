package com.g10.rental.service;

import com.g10.rental.dto.product.CreateProductRequest;
import com.g10.rental.dto.product.CreateProductVariantRequest;
import com.g10.rental.dto.product.ProductResponse;
import com.g10.rental.dto.product.UpdateProductRequest;
import com.g10.rental.entity.Product;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.exception.ProductNotFoundException;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        Product product = getProductEntityById(id);

        return toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());

        Product savedProduct = productRepository.save(product);

        if (request.getVariants() != null) {

            for (CreateProductVariantRequest variantRequest: request.getVariants()) {
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

        return toResponse(savedProduct);
    }

    public ProductResponse updateProduct(
        Long id,
        UpdateProductRequest request
    ) {

        Product product = getProductEntityById(id);

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setCategory(request.category());
        product.setStock(request.stock());

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private Product getProductEntityById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() ->
                new ProductNotFoundException("Product not found with id: " + id)
        );
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getImageUrl(),
            product.getCategory(),
            product.getStock(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }

    private String generateSku() {
        return "SKU-" + UUID.randomUUID()
            .toString()
            .substring(0, 8)
            .toUpperCase();
    }
}