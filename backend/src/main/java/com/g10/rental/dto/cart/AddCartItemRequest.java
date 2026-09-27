package com.g10.rental.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Ported from branch backemd-customer (dto/cart/AddCartItemRequest.java). */
@Getter
@Setter
public class AddCartItemRequest {
    @NotNull
    private Long variantId;

    @NotNull
    @Min(1)
    private Integer quantity;
}
