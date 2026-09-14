package com.g10.rental.web;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * ตัวอย่างการใช้ @PreAuthorize แยกสิทธิ์ตาม role — ลบ/แก้ไขได้ตามต้องการ
 * เก็บไว้เป็นแนวทางสำหรับ endpoint จริงของแต่ละฝั่ง (Customer / Staff / Admin API)
 */
@RestController
public class DemoRoleController {

    @GetMapping("/api/customer/ping")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public Map<String, String> customerPing() {
        return Map.of("message", "customer api ok");
    }

    @GetMapping("/api/staff/ping")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public Map<String, String> staffPing() {
        return Map.of("message", "staff api ok");
    }

    @GetMapping("/api/admin/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> adminPing() {
        return Map.of("message", "admin api ok");
    }
}
