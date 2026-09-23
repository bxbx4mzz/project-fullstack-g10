package com.g10.rental.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.g10.rental.entity.DeliveryMethod;
import com.g10.rental.entity.Rental;
import com.g10.rental.entity.RentalItem;
import com.g10.rental.entity.RentalStatus;

public record RentalResponse(
    Long id,
    String bookingCode,
    String customerName,
    String customerPhone,
    String shippingAddress,
    DeliveryMethod deliveryMethod,
    LocalDate startDate,
    LocalDate endDate,
    Integer totalDays,
    BigDecimal totalPrice,
    BigDecimal discount,
    BigDecimal netPrice,
    RentalStatus status,
    List<RentalItemResponse> items
) {
    public static RentalResponse from(Rental rental) {
        List<RentalItemResponse> itemResponses = (rental.getItems() == null) ? List.of() :
            rental.getItems().stream()
                .map(RentalItemResponse::from)
                .toList();

        return new RentalResponse(
            rental.getId(),
            rental.getBookingCode(),
            rental.getCustomerName(),
            rental.getCustomerPhone(),
            rental.getShippingAddress(),
            rental.getDeliveryMethod(),
            rental.getStartDate(),
            rental.getEndDate(),
            rental.getTotalDays(),
            rental.getTotalPrice(),
            rental.getDiscount(),
            rental.getNetPrice(),
            rental.getStatus(),
            itemResponses
        );
    }

    public record RentalItemResponse(
        Long id,
        Long variantId,
        String productName,
        String sku,
        String size,
        String color,
        Integer quantity,
        BigDecimal subtotal
    ) {
        public static RentalItemResponse from(RentalItem item) {
            return new RentalItemResponse(
                item.getId(),
                item.getVariant().getId(),
                item.getVariant().getProduct().getName(),
                item.getVariant().getSku(),
                item.getVariant().getSize(),
                item.getVariant().getColor(),
                item.getQuantity(),
                item.getSubtotal()
            );
        }
    }
}