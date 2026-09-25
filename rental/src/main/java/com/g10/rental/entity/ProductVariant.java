package com.g10.rental.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false, unique = true)
    private String sku;

    private String size;

    private String color;

    @Column(nullable = false)
    private Integer stockQty;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price3Day;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price5Day;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price7Day;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal extraDayPrice;
}

