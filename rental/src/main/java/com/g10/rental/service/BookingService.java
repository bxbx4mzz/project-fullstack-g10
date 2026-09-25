package com.g10.rental.service;

import com.g10.rental.dto.booking.BookingItemResponse;
import com.g10.rental.dto.booking.BookingResponse;
import com.g10.rental.dto.booking.CreateBookingRequest;
import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingItem;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.Cart;
import com.g10.rental.entity.CartItem;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.entity.User;
import com.g10.rental.repository.BookingRepository;
import com.g10.rental.repository.CartRepository;
import com.g10.rental.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;

    /**
     * Create booking from current user's cart.
     */
    @Transactional
    public BookingResponse createBooking(
            Authentication authentication,
            CreateBookingRequest request
    ) {

        User user = getCurrentUser(authentication);

        validateDates(
                request.getRentDate(),
                request.getReturnDate()
        );

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException("Cart is empty");
        }

        Booking booking = Booking.builder()
                .code(generateBookingCode())
                .customerId(user.getId())
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

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {

            ProductVariant variant = cartItem.getVariant();

            int quantity = cartItem.getQuantity();

            /*
             * Re-check availability at checkout.
             * Cart availability can become outdated.
             */
            var availability =
                    availabilityService.checkAvailability(
                            variant.getId(),
                            request.getRentDate(),
                            request.getReturnDate()
                    );

            if (availability.getAvailableQty() < quantity) {
                throw new RuntimeException(
                        "Not enough availability for variant "
                                + variant.getId()
                );
            }

            BigDecimal unitPrice =
                    calculateRentalPrice(
                            variant,
                            request.getRentDate(),
                            request.getReturnDate()
                    );

            BigDecimal subtotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            BookingItem bookingItem = BookingItem.builder()
                    .booking(booking)
                    .variantId(variant.getId())
                    .qty(quantity)
                    .unitPrice(unitPrice)
                    .build();

            booking.getItems().add(bookingItem);

            totalPrice = totalPrice.add(subtotal);
        }

        booking.setTotalPrice(totalPrice);

        BigDecimal discount = BigDecimal.ZERO;

        booking.setDiscount(discount);

        booking.setFinalPrice(
                totalPrice.subtract(discount)
        );

        Booking savedBooking =
                bookingRepository.save(booking);

        /*
         * Booking has been created successfully,
         * so clear the cart.
         */
        cart.getItems().clear();

        return toResponse(savedBooking);
    }

    /**
     * Get current user's bookings.
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        return bookingRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get one booking belonging to current user.
     */
    @Transactional(readOnly = true)
    public BookingResponse getBooking(
            Authentication authentication,
            Long id
    ) {

        User user = getCurrentUser(authentication);

        Booking booking =
                bookingRepository
                        .findByIdAndCustomerId(
                                id,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"
                                )
                        );

        return toResponse(booking);
    }

    /**
     * Cancel current user's booking.
     */
    @Transactional
    public BookingResponse cancelBooking(
            Authentication authentication,
            Long id
    ) {

        User user = getCurrentUser(authentication);

        Booking booking =
                bookingRepository
                        .findByIdAndCustomerId(
                                id,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"
                                )
                        );

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException(
                    "Booking is already cancelled"
            );
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending booking can be cancelled"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);

        return toResponse(
                bookingRepository.save(booking)
        );
    }

    /**
     * Validate rental dates.
     */
    private void validateDates(
            LocalDate rentDate,
            LocalDate returnDate
    ) {

        if (rentDate == null ||
                returnDate == null) {

            throw new IllegalArgumentException(
                    "Rent date and return date are required"
            );
        }

        if (rentDate.isAfter(returnDate)) {

            throw new IllegalArgumentException(
                    "Rent date must be before or equal to return date"
            );
        }
    }

    /**
     * Calculate rental price based on rental duration.
     *
     * 3 days -> price3Day
     * 5 days -> price5Day
     * 7 days -> price7Day
     * > 7 days -> price7Day + extraDayPrice
     */
    private BigDecimal calculateRentalPrice(
            ProductVariant variant,
            LocalDate rentDate,
            LocalDate returnDate
    ) {

        long rentalDays =
                ChronoUnit.DAYS.between(
                        rentDate,
                        returnDate
                ) + 1;

        if (rentalDays == 3) {
            return variant.getPrice3Day();
        }

        if (rentalDays == 5) {
            return variant.getPrice5Day();
        }

        if (rentalDays == 7) {
            return variant.getPrice7Day();
        }

        if (rentalDays > 7) {

            long extraDays = rentalDays - 7;

            return variant.getPrice7Day()
                    .add(
                            variant.getExtraDayPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    extraDays
                                            )
                                    )
                    );
        }

        throw new IllegalArgumentException(
                "Rental duration must be at least 3 days"
        );
    }

    /**
     * Get currently authenticated user.
     */
    private User getCurrentUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    /**
     * Generate unique booking code.
     */
    private String generateBookingCode() {

        String code;

        do {
            code = "B-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();

        } while (bookingRepository.existsByCode(code));

        return code;
    }

    /**
     * Convert entity to response DTO.
     */
    private BookingResponse toResponse(
            Booking booking
    ) {

        List<BookingItemResponse> items =
                booking.getItems()
                        .stream()
                        .map(item ->
                                BookingItemResponse.builder()
                                        .id(item.getId())
                                        .variantId(
                                                item.getVariantId()
                                        )
                                        .qty(item.getQty())
                                        .unitPrice(
                                                item.getUnitPrice()
                                        )
                                        .build()
                        )
                        .toList();

        return BookingResponse.builder()
                .id(booking.getId())
                .code(booking.getCode())
                .customerId(booking.getCustomerId())
                .customerName(
                        booking.getCustomerName()
                )
                .shippingAddress(
                        booking.getShippingAddress()
                )
                .rentDate(booking.getRentDate())
                .returnDate(booking.getReturnDate())
                .shippingMethod(
                        booking.getShippingMethod()
                )
                .discount(booking.getDiscount())
                .totalPrice(booking.getTotalPrice())
                .finalPrice(booking.getFinalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .items(items)
                .build();
    }
}