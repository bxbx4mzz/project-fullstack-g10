package com.g10.rental.dto.user;

import com.g10.rental.entity.Role;
import com.g10.rental.entity.User;

public record UserResponse(
        Long id,
        String email,
        String name,
        String pictureUrl,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getPictureUrl(), user.getRole());
    }
}
