package com.g10.rental.service;

import com.g10.rental.entity.Role;
import com.g10.rental.entity.User;
import com.g10.rental.repository.UserRepository;
import com.g10.rental.security.CustomOAuth2User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService extends OidcUserService {

    private final UserRepository userRepository;
    private final Set<String> adminEmails;
    private final Set<String> staffEmails;

    public CustomOAuth2UserService(
            UserRepository userRepository,
            @Value("${app.admin-emails:}") String adminEmailsRaw,
            @Value("${app.staff-emails:}") String staffEmailsRaw) {

        this.userRepository = userRepository;
        this.adminEmails = toEmailSet(adminEmailsRaw);
        this.staffEmails = toEmailSet(staffEmailsRaw);
    }

    private static Set<String> toEmailSet(String raw) {

        if (raw == null || raw.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(email -> !email.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest)
            throws OAuth2AuthenticationException {

        // Get user information from Google
        OidcUser oauthUser = super.loadUser(userRequest);

        // Information from Google
        String googleId = oauthUser.getAttribute("sub");
        String email = oauthUser.getAttribute("email");
        Boolean emailVerified = oauthUser.getAttribute("email_verified");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        // Check email
        if (email == null || Boolean.FALSE.equals(emailVerified)) {
            throw new OAuth2AuthenticationException(
                    "อีเมล Google ต้องได้รับการยืนยันก่อนเข้าสู่ระบบ"
            );
        }

        // Find existing user by Google ID first,
        // then try email
        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .map(existing -> {

                    // Update information from Google
                    existing.setName(name);
                    existing.setPictureUrl(picture);
                    existing.setGoogleId(googleId);

                    // Keep existing role
                    return existing;
                })
                .orElseGet(() -> {

                    // Create new user
                    return User.builder()
                            .googleId(googleId)
                            .email(email)
                            .name(name)
                            .pictureUrl(picture)
                            .role(resolveRoleForNewUser(email))
                            .build();
                });

        // Save user
        user = userRepository.save(user);

        // Return custom OAuth user
        return new CustomOAuth2User(user, oauthUser);
    }

    // Determine role for a new user
    private Role resolveRoleForNewUser(String email) {
        String normalized = email.trim().toLowerCase();
        if (adminEmails.contains(normalized)) {
            return Role.ADMIN;
        }
        if (staffEmails.contains(normalized)) {
            return Role.STAFF;
        }

        return Role.CUSTOMER;
    }
}