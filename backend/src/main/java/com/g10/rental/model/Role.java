package com.g10.rental.model;

/**
 * CUSTOMER = ลูกค้าทั่วไป (default เมื่อ login ครั้งแรก)
 * STAFF    = พนักงานร้าน
 * ADMIN    = เจ้าของร้าน
 * กำหนดโดย whitelist อีเมลใน app.admin-emails / app.staff-emails (ดู CustomOAuth2UserService)
 */
public enum Role {
    CUSTOMER,
    STAFF,
    ADMIN
}
