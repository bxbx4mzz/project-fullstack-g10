package com.g10.rental.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.g10.rental.dto.CalendarEventDTO;
import com.g10.rental.service.CalendarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CalendarController {

    private final CalendarService calendarService;

    // สำหรับ Admin/Staff ดูภาพรวมคิวส่งของ-รับคืน
    // GET /api/staff/calendar?start=2026-10-01&end=2026-10-31
    @GetMapping("/staff/calendar")
    public ResponseEntity<List<CalendarEventDTO>> getStaffCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(calendarService.getStaffCalendarEvents(start, end));
    }

    // สำหรับลูกค้าดูว่าชุดชิ้นนี้ (Variant) ติดจองวันไหนบ้าง
    // GET /api/variants/{variantId}/calendar?start=2026-10-01&end=2026-10-31
    @GetMapping("/variants/{variantId}/calendar")
    public ResponseEntity<List<CalendarEventDTO>> getVariantCalendar(
            @PathVariable Long variantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(calendarService.getVariantCalendarEvents(variantId, start, end));
    }
}