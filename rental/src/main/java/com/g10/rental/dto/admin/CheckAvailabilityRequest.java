package com.g10.rental.dto.admin;

import com.g10.rental.entity.DeliveryMethod;
import java.time.LocalDate;

public record CheckAvailabilityRequest(
    Long variantId,
    LocalDate startDate,
    LocalDate endDate,
    DeliveryMethod deliveryMethod
) {}