package com.g10.rental.service;

import com.g10.rental.dto.payment.PaymentResponse;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.Payment;
import com.g10.rental.entity.PaymentStatus;
import com.g10.rental.repository.BookingRepository;
import com.g10.rental.repository.PaymentRepository;
import com.g10.rental.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final MockPaymentService mockPaymentService;

    @Transactional
    public PaymentResponse getPayment(Authentication authentication, Long bookingId) {
        return PaymentResponse.from(findOrCreate(myBooking(authentication, bookingId)));
    }

    @Transactional
    public PaymentResponse pay(Authentication authentication, Long bookingId) {
        Booking booking = myBooking(authentication, bookingId);
        Payment payment = findOrCreate(booking);

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("การจองนี้ชำระเงินเรียบร้อยแล้ว");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("การจองนี้ไม่อยู่ในสถานะที่ชำระเงินได้");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setTransactionId(mockPaymentService.processPayment());
        payment.setPaidAt(LocalDateTime.now());
        booking.setStatus(BookingStatus.CONFIRMED);

        bookingRepository.save(booking);
        return PaymentResponse.from(paymentRepository.save(payment));
    }

    private Payment findOrCreate(Booking booking) {
        return paymentRepository.findByBookingId(booking.getId())
                .orElseGet(() -> paymentRepository.save(Payment.unpaidFor(booking)));
    }

    private Booking myBooking(Authentication authentication, Long bookingId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
        return bookingRepository.findByIdAndCustomerId(bookingId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบการจองนี้"));
    }
}
