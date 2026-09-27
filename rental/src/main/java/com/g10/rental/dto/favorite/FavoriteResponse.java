package com.g10.rental.dto.favorite;

import com.g10.rental.entity.Product;

import java.math.BigDecimal;

public record FavoriteResponse(
    Long id,
    Long productId,
    String name,
    String description,
    BigDecimal price,
    String imageUrl,
    String category,
    Integer stock
) {

    public static FavoriteResponse from(
        Long favoriteId,
        Product product
    ) {
        return new FavoriteResponse(
            favoriteId,
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getImageUrl(),
            product.getCategory(),
            product.getStock()
        );
    }
}