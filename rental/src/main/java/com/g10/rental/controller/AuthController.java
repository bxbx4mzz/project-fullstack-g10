package com.g10.rental.controller;

import com.g10.rental.dto.UserResponse;
import com.g10.rental.security.CustomOAuth2User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Frontend เรียก endpoint นี้หลัง redirect กลับจาก Google (หรือตอนโหลดแอปครั้งแรก)
     * เพื่อเช็คว่ามี session อยู่หรือไม่ และดึง role ของผู้ใช้ปัจจุบัน
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal CustomOAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(UserResponse.from(principal.getUser()));
    }

    // /api/auth/logout ถูกจัดการโดย Spring Security logout filter (ดู SecurityConfig)
}
