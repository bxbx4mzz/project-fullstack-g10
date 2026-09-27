package com.g10.rental.dto.booking;

import java.time.LocalDate;
import java.util.List;

/** New — inspired by branch backend-admin's AdminDashboardController#getDailyTasks, adapted to Booking. */
public record DailyTasksResponse(LocalDate date, List<BookingResponse> toDispatchToday, List<BookingResponse> toReturnToday) {
}
