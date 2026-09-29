package com.g10.rental.dto.booking;

import java.time.LocalDate;
import java.util.List;

public record DailyTasksResponse(LocalDate date, List<BookingResponse> toDispatchToday, List<BookingResponse> toReturnToday) {
}
