package com.g10.rental.dto.booking;

import java.math.BigDecimal;

public record DashboardSummaryResponse(long totalBookings, long activeBookings, BigDecimal totalRevenue) {
}
