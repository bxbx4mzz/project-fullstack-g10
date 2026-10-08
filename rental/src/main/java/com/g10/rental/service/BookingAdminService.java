package com.g10.rental.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.g10.rental.dto.BookingResponseDTO;
import com.g10.rental.dto.UpdateBookingStatusRequest;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingAdminService {

    private final BookingRepository bookingRepository;

    // สรุปตัวเลข Dashboard สำหรับ Staff/Admin
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPending", bookingRepository.countByStatus(BookingStatus.PENDING));
        summary.put("totalConfirmed", bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        summary.put("totalPickedUp", bookingRepository.countByStatus(BookingStatus.PICKED_UP));
        summary.put("totalOverdue", bookingRepository.countByStatus(BookingStatus.OVERDUE));
        return summary;
    }

    // ดึงงานประจำวัน: รายการที่ต้องรับของ / คืนของวันนี้
    public Map<String, List<BookingResponseDTO>> getDailyTasks(LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();

        List<BookingResponseDTO> pickups = bookingRepository.findByStartDateAndStatus(queryDate, BookingStatus.CONFIRMED)
                .stream().map(BookingResponseDTO::fromEntity).collect(Collectors.toList());

        List<BookingResponseDTO> returns = bookingRepository.findByEndDateAndStatus(queryDate, BookingStatus.PICKED_UP)
                .stream().map(BookingResponseDTO::fromEntity).collect(Collectors.toList());

        Map<String, List<BookingResponseDTO>> tasks = new HashMap<>();
        tasks.put("pickupsToday", pickups);
        tasks.put("returnsToday", returns);
        return tasks;
    }

    // อัปเดตสถานะการจอง (เช่น จาก CONFIRMED -> PICKED_UP ตอนส่งมอบของ)
    @Transactional
    public BookingResponseDTO updateStatus(Long bookingId, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("ไม่พบรายการจองรหัส: " + bookingId));

        booking.setStatus(request.getStatus());
        Booking updated = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(updated);
    }
}