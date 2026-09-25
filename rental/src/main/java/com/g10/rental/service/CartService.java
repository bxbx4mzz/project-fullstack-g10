package com.g10.rental.service;

import com.g10.rental.dto.cart.AddCartItemRequest;
import com.g10.rental.dto.cart.CartItemResponse;
import com.g10.rental.dto.cart.CartResponse;
import com.g10.rental.dto.cart.UpdateCartItemRequest;
import com.g10.rental.entity.Cart;
import com.g10.rental.entity.CartItem;
import com.g10.rental.entity.Product;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.entity.User;
import com.g10.rental.repository.CartItemRepository;
import com.g10.rental.repository.CartRepository;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.ProductVariantRepository;
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
    private final ProductVariantRepository productVariantRepository;
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
     * Add variant to current user's cart.
     */
    public CartResponse addItem(
            Authentication authentication,
            AddCartItemRequest request
    ) {

        User user = getCurrentUser(authentication);

        ProductVariant variant = productVariantRepository
                .findById(request.getVariantId())
                .orElseThrow(() ->
                        new RuntimeException("Product variant not found")
                );

        if (request.getQuantity() > variant.getStockQty()) {
            throw new RuntimeException("Not enough variant stock");
        }

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndVariantId(
                        cart.getId(),
                        variant.getId()
                )
                .orElse(null);

        if (cartItem == null) {

            cartItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();

        } else {

            int newQuantity =
                    cartItem.getQuantity() + request.getQuantity();

            if (newQuantity > variant.getStockQty()) {
                throw new RuntimeException("Not enough variant stock");
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

        ProductVariant variant = cartItem.getVariant();

        if (request.getQuantity() > variant.getStockQty()) {
            throw new RuntimeException("Not enough variant stock");
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
                .rentDate(cart.getRentDate())
                .returnDate(cart.getReturnDate())
                .items(items)
                .total(total)
                .build();
    }

    private CartItemResponse toCartItemResponse(
            CartItem item
    ) {

        ProductVariant variant = item.getVariant();

        Product product = productRepository
                .findById(variant.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        /*
         * use 3 day short-term rental price for display in Cart
         * cuz didn't set rental duration
         * when Checkout calculate new price based on rentDate/returnDate
         */
        BigDecimal price = variant.getPrice3Day();

        BigDecimal subtotal =
                price.multiply(
                        BigDecimal.valueOf(item.getQuantity())
                );

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .variantId(variant.getId())
                .productName(product.getName())
                .imageUrl(product.getImageUrl())
                .size(variant.getSize())
                .color(variant.getColor())
                .price(price)
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}