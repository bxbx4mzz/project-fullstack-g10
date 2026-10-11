package com.g10.rental.repository;

import com.g10.rental.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Modifying
    @Query("delete from Favorite f where f.product.id = :productId")
    void deleteAllByProductId(@Param("productId") Long productId);

    @Modifying
    @Query("delete from Favorite f where f.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndProductId(
        Long userId,
        Long productId
    );
}
