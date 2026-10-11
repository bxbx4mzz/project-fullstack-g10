package com.g10.rental.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MockPaymentService {

    public String processPayment() {

        return "MOCK-" +
            UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }
}