package com.g10.rental.controller;

import com.g10.rental.dto.cart.AddCartItemRequest;
import com.g10.rental.dto.cart.CartResponse;
import com.g10.rental.dto.cart.UpdateCartItemRequest;
import com.g10.rental.service.CartService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    @GetMapping("/me")
    public CartResponse getMyCart(
            Authentication authentication
    ) {
        return cartService.getMyCart(authentication);
    }

    @PostMapping("/items")
    public CartResponse addItem(
            Authentication authentication,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return cartService.addItem(
                authentication,
                request
        );
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return cartService.updateItem(
                authentication,
                itemId,
                request
        );
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(
            Authentication authentication,
            @PathVariable Long itemId
    ) {
        return cartService.removeItem(
                authentication,
                itemId
        );
    }

    @DeleteMapping("/me")
    public void clearCart(
            Authentication authentication
    ) {
        cartService.clearCart(authentication);
    }
}