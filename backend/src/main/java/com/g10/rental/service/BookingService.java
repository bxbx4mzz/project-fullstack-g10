package com.g10.rental.service;

import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingItem;
import com.g10.rental.entity.BookingSource;
import com.g10.rental.entity.BookingStatus;
import com.g10.rental.entity.Payment;
import com.g10.rental.entity.PaymentStatus;
import com.g10.rental.entity.Cart;
import com.g10.rental.entity.CartItem;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.entity.User;
import com.g10.rental.repository.BookingRepository;
import com.g10.rental.repository.PaymentRepository;
import com.g10.rental.repository.CartRepository;
import com.g10.rental.repository.UserRepository;
import com.g10.rental.dto.booking.BookingItemResponse;
import com.g10.rental.dto.booking.BookingResponse;
import com.g10.rental.dto.booking.CreateBookingRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Bangkok");

    private final BookingRepository bookingRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;
    private final PaymentRepository paymentRepository;

    @Transactional
    public BookingResponse createBooking(Authentication authentication, CreateBookingRequest request) {
        User user = getCurrentUser(authentication);
        validateDates(request.getRentDate(), request.getReturnDate());

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("ตะกร้ายังว่างอยู่ กรุณาเพิ่มชุดก่อนยืนยันการจอง");
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
                .source(BookingSource.ONLINE)
                .build();

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            int quantity = cartItem.getQuantity();

            var availability = availabilityService.checkAvailability(
                    variant.getId(), request.getRentDate(), request.getReturnDate());

            if (availability.getAvailableQty() < quantity) {
                throw new IllegalArgumentException("ไซซ์ " + variant.getSize() + " / สี " + variant.getColor()
                        + " ว่างในช่วงวันที่เลือกเพียง " + availability.getAvailableQty() + " ชิ้น กรุณาลดจำนวนหรือเปลี่ยนวันที่");
            }

            BigDecimal unitPrice = calculateRentalPrice(variant, request.getRentDate(), request.getReturnDate());
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            booking.getItems().add(BookingItem.builder()
                    .booking(booking)
                    .variantId(variant.getId())
                    .qty(quantity)
                    .unitPrice(unitPrice)
                    .build());

            totalPrice = totalPrice.add(subtotal);
        }

        booking.setTotalPrice(totalPrice);
        booking.setDiscount(BigDecimal.ZERO);
        booking.setFinalPrice(totalPrice);

        Booking savedBooking = bookingRepository.save(booking);
        paymentRepository.save(Payment.unpaidFor(savedBooking));

        cart.getItems().clear();

        return toResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(BookingService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(Authentication authentication, Long id) {
        User user = getCurrentUser(authentication);
        Booking booking = bookingRepository.findByIdAndCustomerId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Authentication authentication, Long id) {
        User user = getCurrentUser(authentication);
        Booking booking = bookingRepository.findByIdAndCustomerId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("การจองนี้ถูกยกเลิกไปแล้ว");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("ยกเลิกได้เฉพาะการจองที่ยังไม่ได้ชำระเงินเท่านั้น");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        paymentRepository.findByBookingId(booking.getId()).ifPresent(p -> p.setStatus(PaymentStatus.CANCELLED));
        return toResponse(bookingRepository.save(booking));
    }

    static void validateDates(LocalDate rentDate, LocalDate returnDate) {
        if (rentDate == null || returnDate == null) {
            throw new IllegalArgumentException("กรุณาเลือกวันที่เช่าและวันที่คืน");
        }
        if (rentDate.isBefore(LocalDate.now(SHOP_ZONE))) {
            throw new IllegalArgumentException("วันที่เช่าต้องไม่ใช่วันที่ผ่านไปแล้ว");
        }
        if (rentDate.isAfter(returnDate)) {
            throw new IllegalArgumentException("วันที่คืนต้องไม่อยู่ก่อนวันที่เช่า");
        }
        long rentalDays = ChronoUnit.DAYS.between(rentDate, returnDate) + 1;
        if (!isSupportedDuration(rentalDays)) {
            throw new IllegalArgumentException(unsupportedDurationMessage(rentalDays));
        }
    }

    private static boolean isSupportedDuration(long days) {
        return days == 3 || days == 5 || days >= 7;
    }

    private static String unsupportedDurationMessage(long days) {
        return "เช่าได้แบบ 3 วัน, 5 วัน หรือ 7 วันขึ้นไปเท่านั้น (ตอนนี้เลือกไว้ " + days + " วัน นับรวมวันรับและวันคืน)";
    }

    static BigDecimal calculateRentalPrice(ProductVariant variant, LocalDate rentDate, LocalDate returnDate) {
        long rentalDays = ChronoUnit.DAYS.between(rentDate, returnDate) + 1;

        if (rentalDays == 3) return variant.getPrice3Day();
        if (rentalDays == 5) return variant.getPrice5Day();
        if (rentalDays == 7) return variant.getPrice7Day();
        if (rentalDays > 7) {
            long extraDays = rentalDays - 7;
            return variant.getPrice7Day().add(variant.getExtraDayPrice().multiply(BigDecimal.valueOf(extraDays)));
        }

        throw new IllegalArgumentException(unsupportedDurationMessage(rentalDays));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    static String generateBookingCode(BookingRepository bookingRepository) {
        String code;
        do {
            code = "B-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (bookingRepository.existsByCode(code));
        return code;
    }

    private String generateBookingCode() {
        return generateBookingCode(bookingRepository);
    }

    static BookingResponse toResponse(Booking booking) {
        List<BookingItemResponse> items = booking.getItems().stream()
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
                .source(booking.getSource())
                .createdAt(booking.getCreatedAt())
                .items(items)
                .build();
    }
}
