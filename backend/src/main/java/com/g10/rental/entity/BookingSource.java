package com.g10.rental.entity;

/**
 * New — not in either source branch. Distinguishes a booking placed by the
 * customer online (through the cart) from one a staff member records for a
 * walk-in customer (see API-SPEC.md "in-store booking").
 */
public enum BookingSource {
    ONLINE,
    IN_STORE
}
