package com.g10.rental.repository;

import com.g10.rental.entity.BookingItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingItemRepository extends JpaRepository<BookingItem, Long> {

    List<BookingItem> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking"})
    List<BookingItem> findByVariantId(Long variantId);
}