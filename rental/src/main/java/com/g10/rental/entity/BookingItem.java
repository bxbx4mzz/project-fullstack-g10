package com.g10.rental.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "booking_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private Long variantId;

    @Column(nullable = false)
    private Integer qty;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
}