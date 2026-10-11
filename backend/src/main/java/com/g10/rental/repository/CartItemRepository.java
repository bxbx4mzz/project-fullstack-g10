package com.g10.rental.repository;

import com.g10.rental.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByIdAndCartId(Long id, Long cartId);

    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);

    @Modifying
    @Query("delete from CartItem ci where ci.variant.id in :variantIds")
    void deleteAllByVariantIds(@Param("variantIds") Collection<Long> variantIds);
}
