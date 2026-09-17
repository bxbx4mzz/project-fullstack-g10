package com.g10.rental.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// endpoint for testing role-based access control
@RestController
public class RoleController {

    @GetMapping("/api/customer")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public Map<String, String> customerPing() {
        return Map.of("message", "customer api ok");
    }

    @GetMapping("/api/staff")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public Map<String, String> staffPing() {
        return Map.of("message", "staff api ok");
    }

    @GetMapping("/api/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> adminPing() {
        return Map.of("message", "admin api ok");
    }
}
