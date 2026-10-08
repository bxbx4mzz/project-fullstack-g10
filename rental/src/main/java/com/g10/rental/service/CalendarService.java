package com.g10.rental.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.g10.rental.dto.CalendarEventDTO;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventDTO> getStaffCalendarEvents(LocalDate start, LocalDate end) {
        List<Booking> bookings = bookingRepository.findBookingsForCalendar(start, end);

        return bookings.stream().map(b -> CalendarEventDTO.builder()
                .bookingId(b.getId())
                .title("Order #" + b.getId() + " (" + b.getStatus() + ")")
                .start(b.getStartDate())
                .end(b.getEndDate().plusDays(1)) // FullCalendar มักนับวัน end แบบ exclusive
                .status(b.getStatus())
                .customerName("User ID: " + b.getUserId())
                .color(getStatusColor(b.getStatus()))
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CalendarEventDTO> getVariantCalendarEvents(Long variantId, LocalDate start, LocalDate end) {
        List<Booking> bookings = bookingRepository.findVariantBookingsForCalendar(variantId, start, end);

        return bookings.stream().map(b -> CalendarEventDTO.builder()
                .bookingId(b.getId())
                .title("ติดจองแล้ว")
                .start(b.getStartDate())
                .end(b.getEndDate().plusDays(1))
                .status(b.getStatus())
                .color("#EF4444") // สีแดงแสดงว่าไม่ว่าง
                .build()
        ).collect(Collectors.toList());
    }

    private String getStatusColor(BookingStatus status) {
        return switch (status) {
            case CONFIRMED -> "#3B82F6"; // สีน้ำเงิน รอรับ
            case PICKED_UP -> "#F59E0B"; // สีส้ม กำลังเช่าอยู่
            case RETURNED -> "#10B981";  // สีเขียว คืนแล้ว
            case OVERDUE -> "#DC2626";   // สีแดง เกินกำหนด
            default -> "#6B7280";        // สีเทา
        };
    }
}