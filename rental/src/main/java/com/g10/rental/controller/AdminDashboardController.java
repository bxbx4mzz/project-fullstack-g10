package com.g10.rental.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.g10.rental.dto.admin.DailyTasksResponse;
import com.g10.rental.dto.admin.DashboardSummaryResponse;
import com.g10.rental.dto.admin.RentalResponse;
import com.g10.rental.entity.Rental;
import com.g10.rental.entity.RentalStatus;
import com.g10.rental.repository.RentalRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final RentalRepository rentalRepository;

    // 1. ดูภาพรวมยอดขายและจำนวนบิล (เฉพาะ ADMIN)
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardSummaryResponse getSummary() {
        List<Rental> allRentals = rentalRepository.findAll();

        BigDecimal totalRevenue = allRentals.stream()
                .filter(r -> r.getStatus() != RentalStatus.CANCELLED)
                .map(Rental::getNetPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeBookings = allRentals.stream()
                .filter(r -> r.getStatus() == RentalStatus.CONFIRMED || r.getStatus() == RentalStatus.RENTING)
                .count();

        return new DashboardSummaryResponse(
                allRentals.size(),
                activeBookings,
                totalRevenue
        );
    }

    // 2. ดูคิวงานประจำวัน: ชุดที่ต้องจัดส่งออก และชุดที่ต้องรับคืน (STAFF & ADMIN เข้าดูได้)
    @GetMapping("/daily-tasks")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public DailyTasksResponse getDailyTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<Rental> allRentals = rentalRepository.findAll();

        // รายการที่ต้องส่งออกในวันนี้ (สถานะยืนยันแล้ว รอส่งของ)
        List<RentalResponse> toDispatch = allRentals.stream()
                .filter(r -> r.getStartDate().isEqual(targetDate) && r.getStatus() == RentalStatus.CONFIRMED)
                .map(RentalResponse::from)
                .toList();

        // รายการที่ต้องรับของคืนในวันนี้ (สถานะกำลังเช่าอยู่)
        List<RentalResponse> toReturn = allRentals.stream()
                .filter(r -> r.getEndDate().isEqual(targetDate) && r.getStatus() == RentalStatus.RENTING)
                .map(RentalResponse::from)
                .toList();

        return new DailyTasksResponse(
                targetDate,
                toDispatch,
                toReturn
        );
    }
}