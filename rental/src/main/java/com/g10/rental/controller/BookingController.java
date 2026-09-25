package com.g10.rental.controller;

import com.g10.rental.dto.booking.BookingResponse;
import com.g10.rental.dto.booking.CreateBookingRequest;
import com.g10.rental.service.BookingService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public BookingResponse createBooking(
            @RequestBody CreateBookingRequest request
    ) {
        return bookingService.createBooking(request);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public List<BookingResponse> getMyBookings() {
        return bookingService.getMyBookings();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public BookingResponse getBooking(
            @PathVariable Long id
    ) {
        return bookingService.getBooking(id);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public BookingResponse cancelBooking(
            @PathVariable Long id
    ) {
        return bookingService.cancelBooking(id);
    }
}