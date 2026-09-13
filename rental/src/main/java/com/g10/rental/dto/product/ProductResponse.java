package com.g10.rental.dto.product;

import java.math.BigDecimal;

// for backend to send product data to frontend
public record ProductResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    String imageUrl,
    String category,
    Integer stock,
    java.time.LocalDateTime createdAt,
    java.time.LocalDateTime updatedAt
) {}