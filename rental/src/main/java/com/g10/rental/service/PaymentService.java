package com.g10.rental.service;

import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.Payment;
import com.g10.rental.entity.PaymentStatus;
import com.g10.rental.repository.BookingRepository;
import com.g10.rental.repository.PaymentRepository;
import com.g10.rental.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final MockPaymentService mockPaymentService;
    private final CartService cartService;

    @Transactional
    public Payment pay(
            Authentication authentication,
            Long bookingId
    ) {

        Long customerId = getCurrentUserId(authentication);

        Payment payment = paymentRepository
                .findByBookingIdAndBookingCustomerId(
                        bookingId,
                        customerId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found"
                        )
                );

        Booking booking = payment.getBooking();

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException(
                    "Booking cannot be paid"
            );
        }

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException(
                    "Payment already completed"
            );
        }

        String transactionId =
                mockPaymentService.processPayment();

        payment.setStatus(PaymentStatus.PAID);
        payment.setTransactionId(transactionId);
        payment.setPaidAt(LocalDateTime.now());

        booking.setStatus(BookingStatus.CONFIRMED);

        bookingRepository.save(booking);

        Payment savedPayment =
                paymentRepository.save(payment);

        // pay successfully, clear the cart
        cartService.clearCart(authentication);

        return savedPayment;
    }

    @Transactional(readOnly = true)
    public Payment getPayment(
            Authentication authentication,
            Long bookingId
    ) {
        Long customerId = getCurrentUserId(authentication);

        return paymentRepository
                .findByBookingIdAndBookingCustomerId(
                        bookingId,
                        customerId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found"
                        )
                );
    }
    
    private Long getCurrentUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                )
                .getId();
    }
}