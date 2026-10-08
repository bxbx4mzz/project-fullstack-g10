package com.g10.rental.dto;

import com.g10.rental.entity.BookingStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateBookingStatusRequest {
    private BookingStatus status;
}