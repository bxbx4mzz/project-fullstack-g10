package com.g10.rental.dto.admin;

import com.g10.rental.entity.RentalStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
    @NotNull(message = "กรุณาระบุสถานะการจอง")
    RentalStatus status
) {}