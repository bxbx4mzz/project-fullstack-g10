package com.g10.rental.entity;

public enum DeliveryMethod {
    EMS(2),       // ส่งไปรษณีย์: เผื่อวันไป-กลับ 2 วัน
    BOLT(0),      // ส่งด่วน Messenger / Bolt: ส่งในวัน เผื่อ 0 วัน
    PICKUP(0);    // มารับที่ร้านเอง: เผื่อ 0 วัน

    private final int bufferDays;

    DeliveryMethod(int bufferDays) {
        this.bufferDays = bufferDays;
    }

    public int getBufferDays() {
        return bufferDays;
    }
}