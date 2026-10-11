package com.g10.rental.dto.calendar;

import com.g10.rental.entity.BookingStatus;

import java.time.LocalDate;

public record CalendarEventResponse(
        Long bookingId,
        String code,
        String customerName,
        LocalDate start,
        LocalDate end,
        BookingStatus status,
        String color
) {
}
