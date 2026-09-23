package com.g10.rental.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.g10.rental.dto.admin.AvailabilityResponse;
import com.g10.rental.dto.admin.CheckAvailabilityRequest;
import com.g10.rental.dto.admin.CreateRentalRequest;
import com.g10.rental.dto.admin.RentalResponse;
import com.g10.rental.dto.admin.UpdateStatusRequest;
import com.g10.rental.entity.Rental;
import com.g10.rental.repository.RentalRepository;
import com.g10.rental.service.RentalAdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/rentals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class AdminRentalController {

    private final RentalAdminService rentalAdminService;
    private final RentalRepository rentalRepository;

    @PostMapping("/check-availability")
    public AvailabilityResponse checkAvailability(@Valid @RequestBody CheckAvailabilityRequest req) {
        return rentalAdminService.checkAvailability(req);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RentalResponse createRental(@Valid @RequestBody CreateRentalRequest req) {
        return rentalAdminService.createRental(req);
    }

    @GetMapping
    public List<RentalResponse> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(RentalResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public RentalResponse getRentalById(@PathVariable Long id) {
        return rentalRepository.findById(id)
                .map(RentalResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบข้อมูลการจองนี้"));
    }

    @PatchMapping("/{id}/status")
    public RentalResponse updateRentalStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบข้อมูลการจองนี้"));

        rental.setStatus(request.status());
        rental = rentalRepository.save(rental);
        return RentalResponse.from(rental);
    }

    @GetMapping("/{id}/summary-message")
    public Map<String, String> getSummaryMessage(@PathVariable Long id) {
        String message = rentalAdminService.generateChatSummary(id);
        return Map.of("message", message);
    }
}