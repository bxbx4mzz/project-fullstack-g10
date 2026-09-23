package com.g10.rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.g10.rental.entity.RentalItem;

@Repository
public interface RentalItemRepository extends JpaRepository<RentalItem, Long> {
}   