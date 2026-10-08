package com.g10.rental.entity;

public enum BookingStatus {
    PENDING,      // ลูกค้าสร้างรายการ รอยืนยัน/รอจ่ายเงิน
    CONFIRMED,    // รายการยืนยันแล้ว รอส่งมอบ
    PICKED_UP,    // รับของไปแล้ว 
    RETURNED,     // ส่งคืนสินค้าแล้ว
    CANCELLED,    // ยกเลิกรายการ
    OVERDUE       // เลยกำหนดส่งคืน
}