package com.g10.rental.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final String frontendUrl;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService,
                           OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                           OAuth2LoginFailureHandler oAuth2LoginFailureHandler,
                           ClientRegistrationRepository clientRegistrationRepository,
                           @Value("${app.frontend-url}") String frontendUrl) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // API ใช้ session cookie (SameSite=Lax) เรียกจาก frontend คนละ origin ในโหมด dev
                // เท่านั้น จึงปิด CSRF ไว้ก่อน (ไม่มีฟอร์ม server-rendered ที่ต้องป้องกัน)
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/oauth2/**", "/login/**", "/api/auth/me", "/api/auth/logout").permitAll()
                        .requestMatchers("/api/customer/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestResolver(new CustomAuthorizationRequestResolver(
                                        clientRegistrationRepository, "/oauth2/authorization")))
                        .userInfoEndpoint(userInfo -> userInfo.oidcUserService(customOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
                        .invalidateHttpSession(true)
                        .deleteCookies("RENTAL_SESSION")
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
