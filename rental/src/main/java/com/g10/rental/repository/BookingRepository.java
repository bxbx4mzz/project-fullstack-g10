package com.g10.rental.repository;

import com.g10.rental.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(
        Long customerId
    );

    Optional<Booking> findByIdAndCustomerId(
        Long id,
        Long customerId
    );

    boolean existsByCode(String code);
}
