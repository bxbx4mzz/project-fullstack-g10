package com.g10.rental.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "Message is required")
        @Size(max = 2000, message = "Message is too long")
        String message
) {
}
