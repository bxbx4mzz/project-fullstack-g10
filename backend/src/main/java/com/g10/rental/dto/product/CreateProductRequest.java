package com.g10.rental.dto.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CreateProductRequest {

    @NotBlank(message = "กรุณาใส่ชื่อสินค้า")
    @Size(max = 255, message = "ชื่อสินค้ายาวเกิน 255 ตัวอักษร")
    private String name;

    @Size(max = 2000, message = "รายละเอียดยาวเกิน 2000 ตัวอักษร")
    private String description;

    @NotNull(message = "กรุณาใส่ราคา")
    @PositiveOrZero(message = "ราคาต้องไม่ติดลบ")
    private BigDecimal price;

    @Size(max = 255, message = "ลิงก์รูปภาพยาวเกิน 255 ตัวอักษร")
    private String imageUrl;

    @NotBlank(message = "กรุณาเลือกหมวดหมู่")
    @Size(max = 255, message = "ชื่อหมวดหมู่ยาวเกิน 255 ตัวอักษร")
    private String category;

    @NotNull(message = "กรุณาใส่จำนวนคงเหลือ")
    @PositiveOrZero(message = "จำนวนคงเหลือต้องไม่ติดลบ")
    private Integer stock;

    @Valid
    private List<CreateProductVariantRequest> variants;
}
