package com.g10.rental.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true)
    private String sku;

    private String size;

    private String color;

    // ฟิลด์จำนวนสต็อกตามที่โค้ดเดิมเรียก getStockQty()
    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty;

    // ฟิลด์ราคาแพ็กเกจวันตามที่ RentalAdminService เดิมเรียกใช้
    private BigDecimal price3Day;
    private BigDecimal price5Day;
    private BigDecimal price7Day;
    private BigDecimal extraDayPrice;

    // รองรับทั้งแบบดึงตรง และแบบ List ในอนาคต
    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TierPrice> tierPrices = new ArrayList<>();
}