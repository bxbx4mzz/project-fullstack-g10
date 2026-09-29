package com.g10.rental.dto.booking;

import com.g10.rental.entity.ShippingMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
        private Integer qty;
    }
}
