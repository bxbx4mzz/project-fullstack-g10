package com.g10.rental.dto.booking;

import com.g10.rental.entity.ShippingMethod;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CreateBookingRequest {
    private String customerName;
    private String shippingAddress;
    private LocalDate rentDate;
    private LocalDate returnDate;
    private ShippingMethod shippingMethod;
    private List<BookingItemRequest> items;
}