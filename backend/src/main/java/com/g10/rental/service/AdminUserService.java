package com.g10.rental.service;

import com.g10.rental.repository.CartRepository;
import com.g10.rental.repository.FavoriteRepository;
import com.g10.rental.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final FavoriteRepository favoriteRepository;

    @Transactional
    public void deleteUser(Long id, Long currentUserId) {
        if (id.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ไม่สามารถลบบัญชีตัวเองได้");
        }
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบผู้ใช้นี้");
        }

        cartRepository.findByUserId(id).ifPresent(cartRepository::delete);
        favoriteRepository.deleteAllByUserId(id);
        userRepository.deleteById(id);
    }
}
