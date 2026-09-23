package com.g10.rental.dto.admin;

import java.time.LocalDate;
import java.util.List;

public record DailyTasksResponse(
    LocalDate date,
    List<RentalResponse> toDispatchToday,
    List<RentalResponse> toReturnToday
) {}