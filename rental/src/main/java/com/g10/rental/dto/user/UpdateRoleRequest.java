package com.g10.rental.dto.user;

import com.g10.rental.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(@NotNull Role role) {
}