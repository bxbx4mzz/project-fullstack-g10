package com.g10.rental.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.g10.rental.dto.BookingResponseDTO;
import com.g10.rental.dto.UpdateBookingStatusRequest;
import com.g10.rental.service.BookingAdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // ป้องกัน CORS กับ Frontend
public class StaffBookingController {

    private final BookingAdminService bookingAdminService;

    // GET /api/staff/dashboard/summary
    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(bookingAdminService.getDashboardSummary());
    }

    // GET /api/staff/dashboard/daily-tasks?date=YYYY-MM-DD
    @GetMapping("/dashboard/daily-tasks")
    public ResponseEntity<Map<String, List<BookingResponseDTO>>> getDailyTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingAdminService.getDailyTasks(date));
    }

    // PATCH /api/staff/bookings/{id}/status
    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody UpdateBookingStatusRequest request) {
        return ResponseEntity.ok(bookingAdminService.updateStatus(id, request));
    }
}