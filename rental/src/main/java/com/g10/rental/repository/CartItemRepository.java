package com.g10.rental.repository;

import com.g10.rental.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByIdAndCartId(Long id, Long cartId);

    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);
}