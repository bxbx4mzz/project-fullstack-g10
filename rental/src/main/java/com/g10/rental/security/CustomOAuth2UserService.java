package com.g10.rental.security;

import com.g10.rental.entity.Role;
import com.g10.rental.entity.User;
import com.g10.rental.repository.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor 
public class CustomOAuth2UserService
        implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser( OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // retrieve user info from Google
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        OAuth2User oauthUser = delegate.loadUser(userRequest);

        // info from Google
        String googleId = oauthUser.getAttribute("sub");
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // find user in database
        User user = userRepository
            .findByEmail(email)
            .orElseGet(() -> {

                User newUser = new User();

                newUser.setGoogleId(googleId);
                newUser.setEmail(email);
                newUser.setName(name);

                // new user logged in with Google OAuth, assign default role as CUSTOMER
                newUser.setRole(Role.CUSTOMER);

                return userRepository.save(newUser);
        });

        // create a SimpleGrantedAuthority based on the user's role
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(
            "ROLE_" + user.getRole().name()
        );

        Map<String, Object> attributes = oauthUser.getAttributes();

        return new DefaultOAuth2User(
            Collections.singleton(authority),
            attributes,
            "email"
        );
    }
}