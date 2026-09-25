package com.g10.rental.controller;

import com.g10.rental.entity.ProductVariant;
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
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public List<ProductVariant> getVariants(
        @PathVariable Long productId,
        @RequestParam(required = false) String search
    ) {
        return productVariantService.getVariants(
            productId,
            search
        );
    }

    @GetMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ProductVariant getVariant(
        @PathVariable Long productId,
        @PathVariable Long variantId
    ) {
        return productVariantService.getVariant(
            productId,
            variantId
        );
    }
}