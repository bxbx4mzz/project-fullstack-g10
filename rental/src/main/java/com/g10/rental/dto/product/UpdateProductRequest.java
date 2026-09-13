package com.g10.rental.dto.product;

import java.math.BigDecimal;

// for staff/admin to edit an existing product
public record UpdateProductRequest(
    String name,
    String description,
    BigDecimal price,
    String imageUrl,
    String category,
    Integer stock
) {}