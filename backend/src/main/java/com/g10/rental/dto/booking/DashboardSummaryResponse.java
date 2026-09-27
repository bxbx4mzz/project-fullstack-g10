package com.g10.rental.dto.booking;

import java.math.BigDecimal;

/** New — inspired by branch backend-admin's AdminDashboardController, adapted to the Booking entity. */
public record DashboardSummaryResponse(long totalBookings, long activeBookings, BigDecimal totalRevenue) {
}
