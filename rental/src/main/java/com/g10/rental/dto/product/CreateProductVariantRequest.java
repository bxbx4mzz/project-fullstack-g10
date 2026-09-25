package com.g10.rental.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateProductVariantRequest {

    private String size;
    private String color;
    private Integer stockQty;
    private BigDecimal price3Day;
    private BigDecimal price5Day;
    private BigDecimal price7Day;
    private BigDecimal extraDayPrice;
}