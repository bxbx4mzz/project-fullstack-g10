package com.g10.rental.dto.admin;

public record AvailabilityResponse(
    Long variantId,
    String sku,
    int totalStock,
    int bookedQuantity,
    int availableQuantity,
    boolean isAvailable
) {}