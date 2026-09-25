package com.g10.rental.dto.booking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingItemRequest {
    private Long variantId;
    private Integer qty;
}