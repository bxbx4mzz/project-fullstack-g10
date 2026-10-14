package com.g10.rental.controller;

import com.g10.rental.dto.product.CreateProductVariantRequest;
import com.g10.rental.entity.ProductVariant;
import jakarta.validation.Valid;
import com.g10.rental.service.ProductVariantService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public List<ProductVariant> getVariants(@PathVariable Long productId, @RequestParam(required = false) String search) {
        return productVariantService.getVariants(productId, search);
    }

    @GetMapping("/{variantId}")
    @PreAuthorize("permitAll()")
    public ProductVariant getVariant(@PathVariable Long productId, @PathVariable Long variantId) {
        return productVariantService.getVariant(productId, variantId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ProductVariant createVariant(@PathVariable Long productId,
                                        @Valid @RequestBody CreateProductVariantRequest request) {
        return productVariantService.createVariant(productId, request);
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ProductVariant updateVariant(@PathVariable Long productId, @PathVariable Long variantId,
                                        @Valid @RequestBody CreateProductVariantRequest request) {
        return productVariantService.updateVariant(productId, variantId, request);
    }

    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public void deleteVariant(@PathVariable Long productId, @PathVariable Long variantId) {
        productVariantService.deleteVariant(productId, variantId);
    }
}
