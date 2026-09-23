package com.g10.rental.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.g10.rental.dto.user.UpdateRoleRequest;
import com.g10.rental.dto.user.UserResponse;
import com.g10.rental.entity.Role;
import com.g10.rental.entity.User;
import com.g10.rental.repository.UserRepository;
import com.g10.rental.security.CustomOAuth2User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. ดูผู้ใช้ทั้งหมด
    @GetMapping
    public List<UserResponse> list() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    // 2. เปลี่ยน Role (มีระบบป้องกันถอดสิทธิ์ตัวเอง)
    @PatchMapping("/{id}/role")
    public UserResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal CustomOAuth2User principal) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบผู้ใช้นี้"));

        if (target.getId().equals(principal.getUser().getId()) && request.role() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ไม่สามารถถอนสิทธิ์ ADMIN ของตัวเองได้");
        }

        target.setRole(request.role());
        target = userRepository.save(target);
        return UserResponse.from(target);
    }

    // 3. ลบผู้ใช้ (ป้องกันไม่ให้แอดมินลบตัวเอง)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomOAuth2User principal) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบผู้ใช้นี้"));

        if (target.getId().equals(principal.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ไม่สามารถลบบัญชี ADMIN ของตัวเองที่กำลังเข้าใช้งานอยู่ได้");
        }

        userRepository.delete(target);
        return ResponseEntity.ok(Map.of("message", "ลบผู้ใช้เรียบร้อยแล้ว"));
    }
}