package com.g10.rental.controller;

import com.g10.rental.service.StaffBookingService;
import com.g10.rental.dto.booking.BookingResponse;
import com.g10.rental.dto.booking.CreateStaffBookingRequest;
import com.g10.rental.dto.booking.DailyTasksResponse;
import com.g10.rental.dto.booking.DashboardSummaryResponse;
import com.g10.rental.dto.booking.UpdateBookingStatusRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffBookingController {

    private final StaffBookingService staffBookingService;

    @GetMapping("/bookings")
    public List<BookingResponse> listBookings() {
        return staffBookingService.listAll();
    }

    @PostMapping("/bookings")
    public BookingResponse createInStoreBooking(@Valid @RequestBody CreateStaffBookingRequest request) {
        return staffBookingService.createInStoreBooking(request);
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateBookingStatusRequest request) {
        return staffBookingService.updateStatus(id, request);
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryResponse dashboardSummary() {
        return staffBookingService.dashboardSummary();
    }

    @GetMapping("/dashboard/daily-tasks")
    public DailyTasksResponse dailyTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return staffBookingService.dailyTasks(date);
    }

    @GetMapping("/bookings/{id}/summary-message")
    public Map<String, String> summaryMessage(@PathVariable Long id) {
        return Map.of("message", staffBookingService.generateSummaryMessage(id));
    }
}
