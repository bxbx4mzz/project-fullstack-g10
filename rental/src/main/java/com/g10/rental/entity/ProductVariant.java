package com.g10.rental.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(unique = true, nullable = false)
    private String sku; // เช่น PRD-0001-BLK-M

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private String color;

    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty; // จำนวนตัวที่มีในสต็อก

    // โครงสร้างราคาตามภาพ JSON
    @Column(name = "price_3_day", nullable = false)
    private BigDecimal price3Day;

    @Column(name = "price_5_day", nullable = false)
    private BigDecimal price5Day;

    @Column(name = "price_7_day", nullable = false)
    private BigDecimal price7Day;

    @Column(name = "extra_day_price", nullable = false)
    private BigDecimal extraDayPrice; // ราคาคิดเพิ่มต่อวันเมื่อเช่าเกินกำหนด
}