package com.g10.rental.repository;

import com.g10.rental.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    Optional<Payment> findByBookingIdAndBookingCustomerId(
            Long bookingId,
            Long customerId
    );
}