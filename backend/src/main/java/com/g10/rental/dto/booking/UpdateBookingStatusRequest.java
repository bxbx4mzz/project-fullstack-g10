package com.g10.rental.dto.booking;

import com.g10.rental.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingStatusRequest(@NotNull BookingStatus status) {
}
