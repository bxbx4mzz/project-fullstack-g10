package com.g10.rental.dto.product;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateProductVariantRequest {

    @Size(max = 255, message = "ไซซ์ยาวเกิน 255 ตัวอักษร")
    private String size;

    @Size(max = 255, message = "สียาวเกิน 255 ตัวอักษร")
    private String color;

    @NotNull(message = "กรุณาใส่จำนวนของแต่ละไซซ์")
    @PositiveOrZero(message = "จำนวนของแต่ละไซซ์ต้องไม่ติดลบ")
    private Integer stockQty;

    @NotNull(message = "กรุณาใส่ราคาเช่า 3 วัน")
    @PositiveOrZero(message = "ราคาเช่า 3 วันต้องไม่ติดลบ")
    private BigDecimal price3Day;

    @NotNull(message = "กรุณาใส่ราคาเช่า 5 วัน")
    @PositiveOrZero(message = "ราคาเช่า 5 วันต้องไม่ติดลบ")
    private BigDecimal price5Day;

    @NotNull(message = "กรุณาใส่ราคาเช่า 7 วัน")
    @PositiveOrZero(message = "ราคาเช่า 7 วันต้องไม่ติดลบ")
    private BigDecimal price7Day;

    @NotNull(message = "กรุณาใส่ราคาวันที่เกิน")
    @PositiveOrZero(message = "ราคาวันที่เกินต้องไม่ติดลบ")
    private BigDecimal extraDayPrice;
}
