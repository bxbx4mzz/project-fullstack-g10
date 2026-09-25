package com.g10.rental.service;

import com.g10.rental.dto.availability.AvailabilityResponse;
import com.g10.rental.entity.BookingItem;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.BookingItemRepository;
import com.g10.rental.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private static final int RETURN_BUFFER_DAYS = 2;

    private final ProductVariantRepository productVariantRepository;
    private final BookingItemRepository bookingItemRepository;

    public AvailabilityResponse checkAvailability(
            Long variantId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                "startDate must be before or equal to endDate"
            );
        }

        ProductVariant variant = productVariantRepository
                .findById(variantId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product variant not found"
                        )
                );

        List<BookingItem> bookingItems =
                bookingItemRepository.findByVariantId(variantId);

        int bookedQty = bookingItems.stream()
                .filter(item ->
                        item.getBooking() != null
                )
                .filter(item ->
                        item.getBooking().getStatus() != BookingStatus.CANCELLED
                )
                .filter(item ->
                        isOverlapping(
                                startDate,
                                endDate,
                                item.getBooking().getRentDate(),
                                item.getBooking().getReturnDate().plusDays(RETURN_BUFFER_DAYS)
                        )
                )
                .mapToInt(BookingItem::getQty)
                .sum();

        int availableQty = variant.getStockQty() - bookedQty;

        return AvailabilityResponse.builder()
            .variantId(variant.getId())
            .stockQty(variant.getStockQty())
            .bookedQty(bookedQty)
            .availableQty(Math.max(availableQty, 0))
            .available(availableQty > 0)
            .build();
    }

    private boolean isOverlapping(
        LocalDate requestedStart,
        LocalDate requestedEnd,
        LocalDate bookedStart,
        LocalDate bookedEnd
    ) {
        return !requestedEnd.isBefore(bookedStart)
            && !requestedStart.isAfter(bookedEnd);
    }
}