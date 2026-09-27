package com.g10.rental.repository;

import com.g10.rental.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Favorite> findByUserIdAndProductId(
        Long userId,
        Long productId
    );

    boolean existsByUserIdAndProductId(
        Long userId,
        Long productId
    );

    void deleteByUserIdAndProductId(
        Long userId,
        Long productId
    );
}