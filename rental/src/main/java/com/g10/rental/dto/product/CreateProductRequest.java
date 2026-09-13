package com.g10.rental.dto.product;

import java.math.BigDecimal;

// for staff/admin to create a new product
public record CreateProductRequest(
    String name,
    String description,
    BigDecimal price,
    String imageUrl,
    String category,
    Integer stock
) {}