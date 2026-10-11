package com.g10.rental.dto.payment;

import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.Payment;
import com.g10.rental.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long bookingId,
        String bookingCode,
        BookingStatus bookingStatus,
        BigDecimal amount,
        PaymentStatus status,
        String transactionId,
        LocalDateTime paidAt
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBooking().getId(),
                payment.getBooking().getCode(),
                payment.getBooking().getStatus(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getTransactionId(),
                payment.getPaidAt());
    }
}
