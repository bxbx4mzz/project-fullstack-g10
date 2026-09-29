package com.g10.rental.dto.availability;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AvailabilityResponse {
    private Long variantId;
    private Integer stockQty;
    private Integer bookedQty;
    private Integer availableQty;
    private Boolean available;
}
