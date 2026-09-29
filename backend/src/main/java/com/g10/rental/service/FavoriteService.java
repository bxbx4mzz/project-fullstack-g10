package com.g10.rental.service;

import com.g10.rental.dto.favorite.FavoriteResponse;
import com.g10.rental.entity.Favorite;
import com.g10.rental.entity.Product;
import com.g10.rental.entity.User;
import com.g10.rental.repository.FavoriteRepository;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addFavorite(Long userId, Long productId) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean alreadyFavorite =
            favoriteRepository.existsByUserIdAndProductId(
                userId,
                productId
            );

        if (alreadyFavorite) {
            return;
        }

        Favorite favorite = Favorite.builder()
            .user(user)
            .product(product)
            .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long productId) {

        if (!favoriteRepository.existsByUserIdAndProductId(
                userId,
                productId
        )) {
            return;
        }

        favoriteRepository.deleteByUserIdAndProductId(
            userId,
            productId
        );
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> getMyFavorites(Long userId) {

        return favoriteRepository
            .findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(favorite ->
                FavoriteResponse.from(
                    favorite.getId(),
                    favorite.getProduct()
                )
            )
            .toList();
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long productId) {

        return favoriteRepository.existsByUserIdAndProductId(
            userId,
            productId
        );
    }
}
