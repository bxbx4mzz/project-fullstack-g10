package com.g10.rental.repository;

import com.g10.rental.entity.Booking;
import com.g10.rental.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Booking> findByIdAndCustomerId(Long id, Long customerId);

    boolean existsByCode(String code);

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("""
            select b from Booking b
            where b.status <> :excluded and b.rentDate <= :end and b.returnDate >= :start
            order by b.rentDate
            """)
    List<Booking> findOverlapping(@Param("start") LocalDate start,
                                  @Param("end") LocalDate end,
                                  @Param("excluded") BookingStatus excluded);
}
