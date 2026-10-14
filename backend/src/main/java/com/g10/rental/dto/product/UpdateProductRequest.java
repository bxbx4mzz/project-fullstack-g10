package com.g10.rental.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequest(
        @NotBlank(message = "กรุณาใส่ชื่อสินค้า")
        @Size(max = 255, message = "ชื่อสินค้ายาวเกิน 255 ตัวอักษร")
        String name,

        @Size(max = 2000, message = "รายละเอียดยาวเกิน 2000 ตัวอักษร")
        String description,

        @NotNull(message = "กรุณาใส่ราคา")
        @PositiveOrZero(message = "ราคาต้องไม่ติดลบ")
        BigDecimal price,

        @Size(max = 255, message = "ลิงก์รูปภาพยาวเกิน 255 ตัวอักษร")
        String imageUrl,

        @Size(max = 8, message = "ใส่รูปได้ไม่เกิน 8 รูป")
        List<@NotBlank @Size(max = 255, message = "ลิงก์รูปภาพยาวเกิน 255 ตัวอักษร") String> imageUrls,

        @NotBlank(message = "กรุณาเลือกหมวดหมู่")
        @Size(max = 255, message = "ชื่อหมวดหมู่ยาวเกิน 255 ตัวอักษร")
        String category,

        @NotNull(message = "กรุณาใส่จำนวนคงเหลือ")
        @PositiveOrZero(message = "จำนวนคงเหลือต้องไม่ติดลบ")
        Integer stock) {
}
