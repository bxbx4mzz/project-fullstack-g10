package com.g10.rental.dto.product;

import java.math.BigDecimal;

public record UpdateProductRequest(
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        String category,
        Integer stock) {
}
