package com.g10.rental.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.g10.rental.entity.Rental;
import com.g10.rental.entity.RentalStatus;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    Optional<Rental> findByBookingCode(String bookingCode);

    @Query("SELECT r FROM Rental r WHERE r.status != :cancelledStatus AND r.bufferedStartDate <= :reqEnd AND r.bufferedEndDate >= :reqStart")
    List<Rental> findActiveOverlappingRentals(
        @Param("reqStart") LocalDate reqStart,
        @Param("reqEnd") LocalDate reqEnd,
        @Param("cancelledStatus") RentalStatus cancelledStatus
    );
}