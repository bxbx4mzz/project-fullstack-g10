package com.g10.rental.entity;

public enum RentalStatus {
    PENDING,    // รอดำเนินการ
    CONFIRMED,  // ยืนยันแล้ว
    RENTING,    // กำลังเช่าอยู่ (ส่งของแล้ว)
    RETURNED,   // คืนของเรียบร้อย
    CANCELLED   // ยกเลิก (สต็อกช่วงนี้จะไม่ถูกนับว่าชน)
}