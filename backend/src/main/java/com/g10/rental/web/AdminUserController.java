package com.g10.rental.web;

import com.g10.rental.model.Role;
import com.g10.rental.model.User;
import com.g10.rental.repository.UserRepository;
import com.g10.rental.security.CustomOAuth2User;
import com.g10.rental.web.dto.UpdateRoleRequest;
import com.g10.rental.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * ให้ ADMIN ดูรายชื่อผู้ใช้ทั้งหมดและมอบ/ถอน role (CUSTOMER / STAFF / ADMIN) ได้
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserResponse> list() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @PatchMapping("/{id}/role")
    public UserResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal CustomOAuth2User principal) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "ไม่พบผู้ใช้นี้"));

        if (target.getId().equals(principal.getUser().getId()) && request.role() != Role.ADMIN) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "ไม่สามารถถอนสิทธิ์ ADMIN ของตัวเองได้");
        }

        target.setRole(request.role());
        target = userRepository.save(target);
        return UserResponse.from(target);
    }
}
