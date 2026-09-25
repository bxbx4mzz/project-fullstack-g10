package com.g10.rental.service;

import com.g10.rental.dto.availability.AvailabilityResponse;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final ProductVariantRepository productVariantRepository;

    public AvailabilityResponse checkAvailability(
            Long variantId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "startDate must be before or equal to endDate"
            );
        }

        ProductVariant variant = productVariantRepository
            .findById(variantId)
            .orElseThrow(() -> new RuntimeException("Product variant not found")
            );

        // todo: implement the logic to get booked quantity from Booking entity
        int bookedQty = 0;

        int availableQty = variant.getStockQty() - bookedQty;

        return AvailabilityResponse.builder()
            .variantId(variant.getId())
            .stockQty(variant.getStockQty())
            .bookedQty(bookedQty)
            .availableQty(Math.max(availableQty, 0))
            .available(availableQty > 0)
            .build();
    }
}
