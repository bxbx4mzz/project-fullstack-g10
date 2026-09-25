package com.g10.rental.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * items
 */
@Entity
@Table(
    name = "cart_items",
    uniqueConstraints = {
        // Ensure that each product can only appear once in a cart
        @UniqueConstraint(
            name = "uk_cart_product",
            columnNames = {"cart_id", "variant_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity;
}
