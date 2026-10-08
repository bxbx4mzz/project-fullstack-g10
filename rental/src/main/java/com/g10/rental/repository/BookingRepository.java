package com.g10.rental.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByStatus(BookingStatus status);

    List<Booking> findByUserId(Long userId);

    // ดึงงานประจำวัน: รายการที่ต้องส่งมอบในวันนี้
    List<Booking> findByStartDateAndStatus(LocalDate startDate, BookingStatus status);

    // ดึงงานประจำวัน: รายการที่ต้องรับคืนในวันนี้
    List<Booking> findByEndDateAndStatus(LocalDate endDate, BookingStatus status);

    // เช็คการชนกันของช่วงเวลาจอง (Availability Check)
    @Query("SELECT COUNT(bi) FROM BookingItem bi " +
           "JOIN bi.booking b " +
           "WHERE bi.variant.id = :variantId " +
           "AND b.status NOT IN (com.g10.rental.entity.BookingStatus.CANCELLED, com.g10.rental.entity.BookingStatus.RETURNED) " +
           "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    long countOverlappingBookings(
            @Param("variantId") Long variantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

        // ดึงรายการจองทั้งหมดที่ทับซ้อนกับช่วงเวลาที่ปฏิทินแสดงผล
    @Query("SELECT b FROM Booking b " +
        "WHERE b.status NOT IN (com.g10.rental.entity.BookingStatus.CANCELLED) " +
        "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    List<Booking> findBookingsForCalendar(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // สำหรับลูกค้าดูเฉพาะคิวของ Variant ชิ้นที่เลือก
    @Query("SELECT b FROM Booking b JOIN b.items bi " +
        "WHERE bi.variant.id = :variantId " +
        "AND b.status NOT IN (com.g10.rental.entity.BookingStatus.CANCELLED) " +
        "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    List<Booking> findVariantBookingsForCalendar(
            @Param("variantId") Long variantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}