package com.g10.rental.controller;

import com.g10.rental.dto.product.CreateProductRequest;
import com.g10.rental.dto.product.ProductResponse;
import com.g10.rental.dto.product.UpdateProductRequest;
import com.g10.rental.service.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize ("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    @PreAuthorize ("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ProductResponse getProductById(
            @PathVariable Long id
    ) {
        return productService.getProductById(id);
    }

    @PostMapping
    @PreAuthorize ("hasAnyRole('STAFF', 'ADMIN')")
    public ProductResponse createProduct(
            @RequestBody CreateProductRequest request
    ) {
        return productService.createProduct(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize ("hasAnyRole('STAFF', 'ADMIN')")
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request
    ) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize ("hasAnyRole('STAFF', 'ADMIN')")
    public void deleteProduct(
            @PathVariable Long id
    ) {
        productService.deleteProduct(id);
    }
}