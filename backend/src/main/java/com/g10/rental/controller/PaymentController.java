package com.g10.rental.controller;

import com.g10.rental.dto.payment.PaymentResponse;
import com.g10.rental.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{bookingId}")
    public PaymentResponse getPayment(Authentication authentication, @PathVariable Long bookingId) {
        return paymentService.getPayment(authentication, bookingId);
    }

    @PostMapping("/{bookingId}")
    public PaymentResponse pay(Authentication authentication, @PathVariable Long bookingId) {
        return paymentService.pay(authentication, bookingId);
    }
}
