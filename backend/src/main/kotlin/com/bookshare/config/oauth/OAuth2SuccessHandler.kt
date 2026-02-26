package com.bookshare.config.oauth

import com.bookshare.config.jwt.JwtTokenProvider
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

@Component
class OAuth2SuccessHandler(
    private val jwtTokenProvider: JwtTokenProvider,
    @Value("\${app.frontend-url}")
    private val frontendUrl: String
) : SimpleUrlAuthenticationSuccessHandler() {

    private val log = LoggerFactory.getLogger(OAuth2SuccessHandler::class.java)

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oAuth2UserPrincipal = authentication.principal as OAuth2UserPrincipal
        val user = oAuth2UserPrincipal.user

        log.info("OAuth2 login success: userId=${user.id}, email=${user.email}")

        val accessToken = jwtTokenProvider.generateToken(user)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user)

        val targetUrl = UriComponentsBuilder.fromUriString("$frontendUrl/oauth/callback")
            .queryParam("accessToken", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build()
            .toUriString()

        log.debug("Redirecting to: $targetUrl")

        if (response.isCommitted) {
            log.debug("Response has already been committed. Unable to redirect.")
            return
        }

        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
}
