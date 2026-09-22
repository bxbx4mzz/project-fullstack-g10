package com.g10.rental.web.dto;

import com.g10.rental.model.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(@NotNull Role role) {
}
