package com.g10.rental.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.g10.rental.entity.DeliveryMethod;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateRentalRequest(
    @NotBlank(message = "กรุณากรอกชื่อลูกค้า")
    String customerName,

    String customerPhone,
    String shippingAddress,

    @NotNull(message = "กรุณาเลือกวิธีจัดส่ง")
    DeliveryMethod deliveryMethod,

    @NotNull(message = "กรุณาระบุวันเริ่มเช่า")
    LocalDate startDate,

    @NotNull(message = "กรุณาระบุวันสิ้นสุดการเช่า")
    LocalDate endDate,

    BigDecimal discount,

    @NotEmpty(message = "ต้องมีรายการชุดอย่างน้อย 1 รายการ")
    @Valid
    List<RentalItemRequest> items
) {
    public record RentalItemRequest(
        @NotNull Long variantId,
        @NotNull Integer quantity
    ) {}
}