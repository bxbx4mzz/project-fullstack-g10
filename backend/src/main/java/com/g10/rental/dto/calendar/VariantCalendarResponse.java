package com.g10.rental.dto.calendar;

import java.time.LocalDate;
import java.util.List;

public record VariantCalendarResponse(Long variantId, int stockQty, List<BookedRange> bookings) {

    public record BookedRange(LocalDate start, LocalDate end, int qty) {
    }
}
