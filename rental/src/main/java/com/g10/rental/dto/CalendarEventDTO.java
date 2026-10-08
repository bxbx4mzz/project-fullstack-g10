package com.g10.rental.dto;

import java.time.LocalDate;

import com.g10.rental.entity.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CalendarEventDTO {
    private Long bookingId;
    private String title;          // เช่น "Booking #101 - ชุดราตรีสีดำ (Size M)"
    private LocalDate start;        // วันที่เริ่มเช่า
    private LocalDate end;          // วันที่ส่งคืน
    private BookingStatus status;
    private String customerName;
    private String color;          // รหัสสีสำหรับแยกสถานะบนปฏิทิน
}