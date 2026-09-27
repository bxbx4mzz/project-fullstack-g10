package com.g10.rental.dto.booking;

import com.g10.rental.entity.ShippingMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/** Ported from branch backemd-customer (dto/booking/CreateBookingRequest.java). Checks out the current user's cart. */
@Getter
@Setter
public class CreateBookingRequest {
    @NotBlank
    private String customerName;

    @NotBlank
    private String shippingAddress;

    @NotNull
    private LocalDate rentDate;

    @NotNull
    private LocalDate returnDate;

    @NotNull
    private ShippingMethod shippingMethod;
}
