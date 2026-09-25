package com.g10.rental.dto.booking;

import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.ShippingMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String code;
    private Long customerId;
    private String customerName;
    private String shippingAddress;
    private LocalDate rentDate;
    private LocalDate returnDate;
    private ShippingMethod shippingMethod;
    private BigDecimal discount;
    private BigDecimal totalPrice;
    private BigDecimal finalPrice;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private List<BookingItemResponse> items;
}
