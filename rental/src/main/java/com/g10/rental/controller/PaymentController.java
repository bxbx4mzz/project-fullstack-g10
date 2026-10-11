package com.g10.rental.controller;

import com.g10.rental.dto.payment.PaymentResponse;
import com.g10.rental.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{bookingId}")
    public ResponseEntity<PaymentResponse> getPayment(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(
                PaymentResponse.from(
                        paymentService.getPayment(authentication, bookingId)
                )
        );
    }

    @PostMapping("/{bookingId}")
    public ResponseEntity<PaymentResponse> pay(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(
                PaymentResponse.from(
                        paymentService.pay(authentication, bookingId)
                )
        );
    }
}