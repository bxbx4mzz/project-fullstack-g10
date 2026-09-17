package com.g10.rental.security;

import com.g10.rental.model.Role;
import com.g10.rental.model.User;
import com.g10.rental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Runs after Google returns the user's profile. Upserts a {@link User} row
 * and decides the role: existing users keep their current role (an admin
 * may have promoted them via the admin panel later on); brand new users get
 * ADMIN/STAFF only if their email is in the whitelist, otherwise CUSTOMER.
 */
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
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oAuth2User = super.loadUser(userRequest);

        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        Boolean emailVerified = oAuth2User.getAttribute("email_verified");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null || Boolean.FALSE.equals(emailVerified)) {
            throw new OAuth2AuthenticationException("อีเมล Google ต้องได้รับการยืนยันก่อนเข้าสู่ระบบ");
        }

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .map(existing -> {
                    existing.setName(name);
                    existing.setPictureUrl(picture);
                    existing.setGoogleId(googleId);
                    return existing;
                })
                .orElseGet(() -> User.builder()
                        .googleId(googleId)
                        .email(email)
                        .name(name)
                        .pictureUrl(picture)
                        .role(resolveRoleForNewUser(email))
                        .build());

        user = userRepository.save(user);

        return new CustomOAuth2User(user, oAuth2User);
    }

    private Role resolveRoleForNewUser(String email) {
        String normalized = email.toLowerCase();
        if (adminEmails.contains(normalized)) {
            return Role.ADMIN;
        }
        if (staffEmails.contains(normalized)) {
            return Role.STAFF;
        }
        return Role.CUSTOMER;
    }
}
