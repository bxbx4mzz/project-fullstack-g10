package com.g10.rental.dto.booking;

import com.g10.rental.entity.ShippingMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CreateStaffBookingRequest {
    @NotBlank
    private String customerName;

    private String shippingAddress;

    @NotNull
    private LocalDate rentDate;

    @NotNull
    private LocalDate returnDate;

    @NotNull
    private ShippingMethod shippingMethod;

    @PositiveOrZero(message = "ส่วนลดต้องไม่ติดลบ")
    private BigDecimal discount;

    @NotEmpty
    @Valid
    private List<Item> items;

    @Getter
    @Setter
    public static class Item {
        @NotNull
        private Long variantId;

        @NotNull
        @Min(value = 1, message = "จำนวนต้องมีอย่างน้อย 1 ชิ้น")
        private Integer qty;
    }
}
