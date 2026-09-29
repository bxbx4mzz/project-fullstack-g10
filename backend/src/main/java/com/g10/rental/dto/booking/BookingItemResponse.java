package com.g10.rental.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class BookingItemResponse {
    private Long id;
    private Long variantId;
    private Integer qty;
    private BigDecimal unitPrice;
}
