package com.g10.rental.config;

import com.g10.rental.security.CustomOAuth2UserService;

import lombok.AllArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
@AllArgsConstructor 
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // google OAuth
                .requestMatchers(
                    "/oauth2/**",
                    "/login/**"
                ).permitAll()

                // public API
                .requestMatchers(
                    "/api/products/**"
                ).permitAll()

                .anyRequest().authenticated()
            )

            // flow
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl(
                    "http://localhost:5173/",
                    true
                )
            );

        return http.build();
    }
}