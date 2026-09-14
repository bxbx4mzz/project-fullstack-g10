package com.g10.rental.security;

import com.g10.rental.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Wraps our own {@link User} entity so downstream code (controllers,
 * @PreAuthorize checks) can access app-specific fields (id, role, ...)
 * instead of raw Google attributes. Google's registration requests the
 * "openid" scope, so Spring Security authenticates via the OIDC path -
 * this must implement OidcUser (not just OAuth2User) or @AuthenticationPrincipal
 * injection silently fails and every request looks unauthenticated.
 */
public class CustomOAuth2User implements OidcUser {

    private final User user;
    private final OidcUser oidcUser;

    public CustomOAuth2User(User user, OidcUser oidcUser) {
        this.user = user;
        this.oidcUser = oidcUser;
    }

    public User getUser() {
        return user;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oidcUser.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getName() {
        return user.getEmail();
    }

    @Override
    public Map<String, Object> getClaims() {
        return oidcUser.getClaims();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return oidcUser.getUserInfo();
    }

    @Override
    public OidcIdToken getIdToken() {
        return oidcUser.getIdToken();
    }
}
