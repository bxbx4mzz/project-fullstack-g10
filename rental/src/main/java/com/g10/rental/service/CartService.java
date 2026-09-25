package com.g10.rental.service;

import com.g10.rental.dto.cart.AddCartItemRequest;
import com.g10.rental.dto.cart.CartItemResponse;
import com.g10.rental.dto.cart.CartResponse;
import com.g10.rental.dto.cart.UpdateCartItemRequest;
import com.g10.rental.entity.Cart;
import com.g10.rental.entity.CartItem;
import com.g10.rental.entity.Product;
import com.g10.rental.entity.User;
import com.g10.rental.repository.CartItemRepository;
import com.g10.rental.repository.CartRepository;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Get current user's cart.
     * If the user does not have a cart yet, create one.
     */
    @Transactional(readOnly = true)
    public CartResponse getMyCart(Authentication authentication) {

        User user = getCurrentUser(authentication);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));

        return toCartResponse(cart);
    }

    /**
     * Add product to current user's cart.
     */
    public CartResponse addItem(
            Authentication authentication,
            AddCartItemRequest request
    ) {

        User user = getCurrentUser(authentication);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        if (request.getQuantity() > product.getStock()) {
            throw new RuntimeException("Not enough product stock");
        }

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));

        CartItem cartItem = cartItemRepository
            .findByCartIdAndProductId(
                    cart.getId(),
                    product.getId()
            )
            .orElse(null);

        if (cartItem == null) {

            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();

        } else {

            int newQuantity =
                    cartItem.getQuantity() + request.getQuantity();

            if (newQuantity > product.getStock()) {
                throw new RuntimeException("Not enough product stock");
            }

            cartItem.setQuantity(newQuantity);
        }

        cartItemRepository.save(cartItem);

        return toCartResponse(cart);
    }

    /**
     * Update quantity of a cart item.
     */
    public CartResponse updateItem(
            Authentication authentication,
            Long itemId,
            UpdateCartItemRequest request
    ) {

        User user = getCurrentUser(authentication);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        CartItem cartItem = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found")
                );

        Product product = cartItem.getProduct();

        if (request.getQuantity() > product.getStock()) {
            throw new RuntimeException("Not enough product stock");
        }

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return toCartResponse(cart);
    }

    /**
     * Remove one item from current user's cart.
     */
    public CartResponse removeItem(
        Authentication authentication,
        Long itemId
        ) {     

        User user = getCurrentUser(authentication);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        CartItem cartItem = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found")
                );

        cartItemRepository.delete(cartItem);
        cartItemRepository.flush();

        cart.getItems().remove(cartItem);

        return toCartResponse(cart);
        }

    /**
     * Clear current user's cart.
     */
    public void clearCart(Authentication authentication) {

        User user = getCurrentUser(authentication);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        cartItemRepository.deleteAll(cart.getItems());

        cart.getItems().clear();
    }

    private User getCurrentUser(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }

    private Cart createCart(User user) {

        Cart cart = Cart.builder()
                .user(user)
                .items(new ArrayList<>())
                .build();

        return cartRepository.save(cart);
    }

    private CartResponse toCartResponse(Cart cart) {

        List<CartItemResponse> items = cart.getItems()
                .stream()
                .map(this::toCartItemResponse)
                .toList();

        BigDecimal total = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .total(total)
                .build();
    }

    private CartItemResponse toCartItemResponse(
            CartItem item
    ) {

        Product product = item.getProduct();

        BigDecimal subtotal =
                product.getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}