package com.g10.rental.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Login สำเร็จ -> session cookie ถูกตั้งค่าแล้วโดย Spring Security
 * -> redirect กลับไปหน้า frontend เพื่อให้ frontend เรียก GET /api/auth/me ต่อ
 */
@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(@Value("${app.frontend-url}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException, ServletException {
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/oauth2/redirect");
    }
}
