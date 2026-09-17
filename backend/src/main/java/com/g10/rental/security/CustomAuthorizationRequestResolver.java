package com.g10.rental.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Google keeps its own login session in the browser independent of our app's
 * session cookie, so logging out of the app alone leaves the user signed
 * into Google - the next login silently re-authenticates the same account
 * with no account picker. Adding prompt=select_account forces Google to show
 * the account chooser on every login attempt.
 */
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository,
                                               String authorizationRequestBaseUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return withSelectAccountPrompt(defaultResolver.resolve(request));
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return withSelectAccountPrompt(defaultResolver.resolve(request, clientRegistrationId));
    }

    private OAuth2AuthorizationRequest withSelectAccountPrompt(OAuth2AuthorizationRequest authorizationRequest) {
        if (authorizationRequest == null) {
            return null;
        }
        Map<String, Object> additionalParameters = new HashMap<>(authorizationRequest.getAdditionalParameters());
        additionalParameters.put("prompt", "select_account");
        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .additionalParameters(additionalParameters)
                .build();
    }
}
