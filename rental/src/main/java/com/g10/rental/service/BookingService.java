package com.g10.rental.service;

import com.g10.rental.dto.booking.BookingItemRequest;
import com.g10.rental.dto.booking.BookingItemResponse;
import com.g10.rental.dto.booking.BookingResponse;
import com.g10.rental.dto.booking.CreateBookingRequest;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingItem;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    @Transactional
    public BookingResponse createBooking(
            CreateBookingRequest request
    ) {

        Booking booking = Booking.builder()
            .code(generateBookingCode())
            .customerId(1L)
            .customerName(request.getCustomerName())
            .shippingAddress(request.getShippingAddress())
            .rentDate(request.getRentDate())
            .returnDate(request.getReturnDate())
            .shippingMethod(request.getShippingMethod())
            .discount(BigDecimal.ZERO)
            .totalPrice(BigDecimal.ZERO)
            .finalPrice(BigDecimal.ZERO)
            .status(BookingStatus.PENDING)
            .build();

        for (BookingItemRequest itemRequest : request.getItems()) {

            BookingItem item = BookingItem.builder()
                .booking(booking)
                .variantId(itemRequest.getVariantId())
                .qty(itemRequest.getQty())
                .unitPrice(BigDecimal.ZERO)
                .build();

            booking.getItems().add(item);
        }

        Booking savedBooking = bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {

        Long customerId = 1L;

        return bookingRepository
            .findByCustomerIdOrderByCreatedAtDesc(customerId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(Long id) {

        Long customerId = 1L;

        Booking booking = bookingRepository
            .findByIdAndCustomerId(id, customerId)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found")
            );

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id) {

        Long customerId = 1L;

        Booking booking = bookingRepository
                .findByIdAndCustomerId(id, customerId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found")
                );

        booking.setStatus(BookingStatus.CANCELLED);

        Booking savedBooking = bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    private BookingResponse toResponse(Booking booking) {

        List<BookingItemResponse> items =
            booking.getItems()
                    .stream()
                    .map(item -> BookingItemResponse.builder()
                        .id(item.getId())
                        .variantId(item.getVariantId())
                        .qty(item.getQty())
                        .unitPrice(item.getUnitPrice())
                        .build())
                    .toList();

        return BookingResponse.builder()
            .id(booking.getId())
            .code(booking.getCode())
            .customerId(booking.getCustomerId())
            .customerName(booking.getCustomerName())
            .shippingAddress(booking.getShippingAddress())
            .rentDate(booking.getRentDate())
            .returnDate(booking.getReturnDate())
            .shippingMethod(booking.getShippingMethod())
            .discount(booking.getDiscount())
            .totalPrice(booking.getTotalPrice())
            .finalPrice(booking.getFinalPrice())
            .status(booking.getStatus())
            .createdAt(booking.getCreatedAt())
            .items(items)
            .build();
    }   

    private String generateBookingCode() {

        return "B-" + UUID.randomUUID()
            .toString()
            .substring(0, 8)
            .toUpperCase();
    }
}
