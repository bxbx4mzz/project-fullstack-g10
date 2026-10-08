package com.g10.rental.dto;

import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private Long userId;
    private BookingStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private List<BookingItemDTO> items;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingItemDTO {
        private Long variantId;
        private String sku;
        private Integer quantity;
        private BigDecimal price;
    }

    public static BookingResponseDTO fromEntity(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .status(booking.getStatus())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .totalPrice(booking.getTotalPrice())
                .items(booking.getItems() != null ? booking.getItems().stream()
                        .map(item -> BookingItemDTO.builder()
                                .variantId(item.getVariant().getId())
                                .sku(item.getVariant().getSku())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build())
                        .collect(Collectors.toList()) : List.of())
                .build();
    }
}