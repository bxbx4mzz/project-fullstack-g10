package com.g10.rental.controller;

import com.g10.rental.dto.calendar.CalendarEventResponse;
import com.g10.rental.dto.calendar.VariantCalendarResponse;
import com.g10.rental.service.CalendarService;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/api/staff/calendar")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public List<CalendarEventResponse> staffCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return calendarService.staffEvents(start, end);
    }

    @GetMapping("/api/variants/{variantId}/calendar")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public VariantCalendarResponse variantCalendar(
            @PathVariable Long variantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return calendarService.variantEvents(variantId, start, end);
    }
}
