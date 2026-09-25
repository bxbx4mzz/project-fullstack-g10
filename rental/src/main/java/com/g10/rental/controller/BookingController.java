package com.g10.rental.controller;

import com.g10.rental.dto.booking.BookingResponse;
import com.g10.rental.dto.booking.CreateBookingRequest;
import com.g10.rental.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public BookingResponse createBooking(
            Authentication authentication,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return bookingService.createBooking(
                authentication,
                request
        );
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public List<BookingResponse> getMyBookings(
            Authentication authentication
    ) {
        return bookingService.getMyBookings(authentication);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public BookingResponse getBooking(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return bookingService.getBooking(
                authentication,
                id
        );
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public BookingResponse cancelBooking(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return bookingService.cancelBooking(
                authentication,
                id
        );
    }
}