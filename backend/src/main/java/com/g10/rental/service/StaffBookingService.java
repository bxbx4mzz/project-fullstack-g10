package com.g10.rental.service;

import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingItem;
import com.g10.rental.entity.BookingSource;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.BookingRepository;
import com.g10.rental.repository.ProductVariantRepository;
import com.g10.rental.dto.availability.AvailabilityResponse;
import com.g10.rental.dto.booking.BookingResponse;
import com.g10.rental.dto.booking.CreateStaffBookingRequest;
import com.g10.rental.dto.booking.DailyTasksResponse;
import com.g10.rental.dto.booking.DashboardSummaryResponse;
import com.g10.rental.dto.booking.UpdateBookingStatusRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * New — not in either source branch. Gives STAFF/ADMIN the same booking read/write access the
 * customer-facing BookingController gives customers, plus two things customers can't do:
 * recording a walk-in (in-store) booking directly with an explicit item list (no cart), and
 * moving a booking through its status lifecycle (see API-SPEC.md "Bookings").
 *
 * Reuses BookingService's package-private pricing/code/mapping helpers so both booking paths
 * (online checkout vs staff-recorded) compute the exact same tier price and produce the same
 * response shape.
 */
@Service
@RequiredArgsConstructor
public class StaffBookingService {

    private final BookingRepository bookingRepository;
    private final ProductVariantRepository productVariantRepository;
    private final AvailabilityService availabilityService;

    @Transactional(readOnly = true)
    public List<BookingResponse> listAll() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(BookingService::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse updateStatus(Long id, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setStatus(request.status());
        return BookingService.toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse createInStoreBooking(CreateStaffBookingRequest request) {
        if (request.getRentDate().isAfter(request.getReturnDate())) {
            throw new IllegalArgumentException("Rent date must be before or equal to return date");
        }

        Booking booking = Booking.builder()
                .code(BookingService.generateBookingCode(bookingRepository))
                .customerId(null)
                .customerName(request.getCustomerName())
                .shippingAddress(
                        request.getShippingAddress() == null || request.getShippingAddress().isBlank()
                                ? "รับที่ร้าน"
                                : request.getShippingAddress())
                .rentDate(request.getRentDate())
                .returnDate(request.getReturnDate())
                .shippingMethod(request.getShippingMethod())
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .totalPrice(BigDecimal.ZERO)
                .finalPrice(BigDecimal.ZERO)
                .status(BookingStatus.CONFIRMED)
                .source(BookingSource.IN_STORE)
                .build();

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CreateStaffBookingRequest.Item item : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Product variant not found: " + item.getVariantId()));

            AvailabilityResponse availability = availabilityService.checkAvailability(
                    variant.getId(), request.getRentDate(), request.getReturnDate());

            if (availability.getAvailableQty() < item.getQty()) {
                throw new RuntimeException("Not enough availability for variant " + variant.getId());
            }

            BigDecimal unitPrice = BookingService.calculateRentalPrice(variant, request.getRentDate(), request.getReturnDate());
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQty()));

            booking.getItems().add(BookingItem.builder()
                    .booking(booking)
                    .variantId(variant.getId())
                    .qty(item.getQty())
                    .unitPrice(unitPrice)
                    .build());

            totalPrice = totalPrice.add(subtotal);
        }

        booking.setTotalPrice(totalPrice);
        booking.setFinalPrice(totalPrice.subtract(booking.getDiscount()));

        return BookingService.toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse dashboardSummary() {
        List<Booking> all = bookingRepository.findAll();

        BigDecimal totalRevenue = all.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .map(Booking::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeBookings = all.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.SHIPPED)
                .count();

        return new DashboardSummaryResponse(all.size(), activeBookings, totalRevenue);
    }

    @Transactional(readOnly = true)
    public DailyTasksResponse dailyTasks(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<Booking> all = bookingRepository.findAll();

        List<BookingResponse> toDispatch = all.stream()
                .filter(b -> b.getRentDate().isEqual(targetDate) && b.getStatus() == BookingStatus.CONFIRMED)
                .map(BookingService::toResponse)
                .toList();

        List<BookingResponse> toReturn = all.stream()
                .filter(b -> b.getReturnDate().isEqual(targetDate) && b.getStatus() == BookingStatus.SHIPPED)
                .map(BookingService::toResponse)
                .toList();

        return new DailyTasksResponse(targetDate, toDispatch, toReturn);
    }
}
