package com.g10.rental.service;

import com.g10.rental.dto.calendar.CalendarEventResponse;
import com.g10.rental.dto.calendar.VariantCalendarResponse;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.BookingItemRepository;
import com.g10.rental.repository.BookingRepository;
import com.g10.rental.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private static final long MAX_RANGE_DAYS = 366;

    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> staffEvents(LocalDate start, LocalDate end) {
        validateRange(start, end);
        return bookingRepository.findOverlapping(start, end, BookingStatus.CANCELLED).stream()
                .map(b -> new CalendarEventResponse(
                        b.getId(), b.getCode(), b.getCustomerName(),
                        b.getRentDate(), b.getReturnDate(), b.getStatus(), colorFor(b.getStatus())))
                .toList();
    }

    @Transactional(readOnly = true)
    public VariantCalendarResponse variantEvents(Long variantId, LocalDate start, LocalDate end) {
        validateRange(start, end);
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product variant not found"));

        List<VariantCalendarResponse.BookedRange> ranges = bookingItemRepository.findByVariantId(variantId).stream()
                .filter(item -> item.getBooking() != null && item.getBooking().getStatus() != BookingStatus.CANCELLED)
                .map(item -> {
                    Booking b = item.getBooking();
                    LocalDate blockedUntil = b.getReturnDate().plusDays(AvailabilityService.RETURN_BUFFER_DAYS);
                    return new VariantCalendarResponse.BookedRange(b.getRentDate(), blockedUntil, item.getQty());
                })
                .filter(r -> !r.start().isAfter(end) && !r.end().isBefore(start))
                .toList();

        return new VariantCalendarResponse(variant.getId(), variant.getStockQty(), ranges);
    }

    private void validateRange(LocalDate start, LocalDate end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("start must be before or equal to end");
        }
        if (ChronoUnit.DAYS.between(start, end) > MAX_RANGE_DAYS) {
            throw new IllegalArgumentException("Date range must not exceed " + MAX_RANGE_DAYS + " days");
        }
    }

    private static String colorFor(BookingStatus status) {
        return switch (status) {
            case PENDING -> "#9CA3AF";
            case CONFIRMED -> "#3B82F6";
            case SHIPPED -> "#F59E0B";
            case RETURNED -> "#10B981";
            case CANCELLED -> "#EF4444";
        };
    }
}
