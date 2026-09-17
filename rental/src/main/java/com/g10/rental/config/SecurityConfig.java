package com.g10.rental.config;

import com.g10.rental.security.OAuth2LoginFailureHandler;
import com.g10.rental.security.OAuth2LoginSuccessHandler;
import com.g10.rental.service.CustomOAuth2UserService;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final String frontendUrl;

    public SecurityConfig(
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
            OAuth2LoginFailureHandler oAuth2LoginFailureHandler,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )

            .csrf(csrf ->
                csrf.disable()
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.IF_REQUIRED
                )
            )

            .authorizeHttpRequests(auth -> auth
                // Google OAuth2
                .requestMatchers(
                        "/oauth2/**",
                        "/login/**"
                ).permitAll()

                // Authentication API
                .requestMatchers(
                        "/api/auth/me",
                        "/api/auth/logout"
                ).permitAll()

                // Products are public
                .requestMatchers(
                        "/api/products/**"
                ).permitAll()

                // CUSTOMER
                .requestMatchers(
                    "/api/customer/**"
                ).hasAnyRole(
                    "CUSTOMER",
                    "STAFF",
                    "ADMIN"
                )

                // STAFF
                .requestMatchers(
                    "/api/staff/**"
                ).hasAnyRole(
                    "STAFF",
                    "ADMIN"
                )

                // ADMIN
                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")

                // Everything else requires login
                .anyRequest().authenticated()
            )

            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo ->
                    userInfo.oidcUserService(
                        customOAuth2UserService
                    )
                )
                .successHandler(
                        oAuth2LoginSuccessHandler
                )
                .failureHandler(
                        oAuth2LoginFailureHandler
                )
            )

            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler(
                    (request, response, authentication) ->
                            response.setStatus(
                                    HttpStatus.OK.value()
                            )
                )
                .invalidateHttpSession(true)
                .deleteCookies(
                    "RENTAL_SESSION"
                )
            )

            .exceptionHandling(ex ->
                ex.authenticationEntryPoint(
                    new HttpStatusEntryPoint(
                        HttpStatus.UNAUTHORIZED
                    )
                )
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of(frontendUrl)
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
