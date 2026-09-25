package com.g10.rental.dto.cart;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class CartResponse {
    private Long id;
    private LocalDate rentDate;
    private LocalDate returnDate;
    private List<CartItemResponse> items;
    private BigDecimal total;
}