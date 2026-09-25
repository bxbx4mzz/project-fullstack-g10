package com.g10.rental.service;

import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;

    public List<ProductVariant> getVariants(
            Long productId,
            String search
    ) {
        List<ProductVariant> variants =
                productVariantRepository.findByProductId(productId);

        if (search == null || search.isBlank()) {
            return variants;
        }

        String keyword = search.toLowerCase();

        return variants.stream()
                .filter(v ->
                        (v.getSku() != null &&
                                v.getSku().toLowerCase().contains(keyword))
                        ||
                        (v.getSize() != null &&
                                v.getSize().toLowerCase().contains(keyword))
                        ||
                        (v.getColor() != null &&
                                v.getColor().toLowerCase().contains(keyword))
                )
                .toList();
    }

    public ProductVariant getVariant(
            Long productId,
            Long variantId
    ) {
        return productVariantRepository
                .findByIdAndProductId(variantId, productId)
                .orElseThrow(() ->
                        new RuntimeException("Product variant not found")
                );
    }
}