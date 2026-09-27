package com.g10.rental.dto.booking;

import com.g10.rental.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

/** New — mirrors the ADMIN_EMAILS-style UpdateStatusRequest pattern seen in branch backend-admin. */
public record UpdateBookingStatusRequest(@NotNull BookingStatus status) {
}
