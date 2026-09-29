package com.g10.rental.controller;

import com.g10.rental.dto.favorite.FavoriteResponse;
import com.g10.rental.entity.User;
import com.g10.rental.repository.UserRepository;
import com.g10.rental.service.FavoriteService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(
        @PathVariable Long productId,
        Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        favoriteService.addFavorite(
            user.getId(),
            productId
        );

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(
        @PathVariable Long productId,
        Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        favoriteService.removeFavorite(
            user.getId(),
            productId
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<FavoriteResponse>> getMyFavorites(
        Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        List<FavoriteResponse> favorites =
            favoriteService.getMyFavorites(user.getId());

        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Boolean> checkFavorite(
        @PathVariable Long productId,
        Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        boolean isFavorite =
            favoriteService.isFavorite(
                user.getId(),
                productId
            );

        return ResponseEntity.ok(isFavorite);
    }

    private User getAuthenticatedUser(
        Authentication authentication
    ) {

        if (authentication == null ||
            !authentication.isAuthenticated()) {

            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
            .orElseThrow(
                () -> new RuntimeException("User not found")
            );
    }
}
