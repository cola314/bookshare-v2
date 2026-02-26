package com.bookshare.config

import com.bookshare.config.jwt.JwtAuthenticationFilter
import com.bookshare.config.oauth.CustomOAuth2UserService
import com.bookshare.config.oauth.OAuth2SuccessHandler
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val customOAuth2UserService: CustomOAuth2UserService,
    private val oAuth2SuccessHandler: OAuth2SuccessHandler,
    @Value("\${app.frontend-url}")
    private val frontendUrl: String,
    @Value("\${app.cors.allowed-origins}")
    private val corsAllowedOrigins: String
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { authorize ->
                authorize
                    // Public endpoints
                    .requestMatchers(
                        "/api/health",
                        "/api/health/**",
                        "/api/stats",
                        "/api/auth/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/api-docs/**",
                        "/oauth2/**",
                        "/login/oauth2/**"
                    ).permitAll()
                    // Public read-only endpoints for books and comments
                    .requestMatchers(HttpMethod.GET, "/api/books", "/api/books/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/users/*/books").permitAll()
                    // Public endpoints for notices (GET only)
                    .requestMatchers(HttpMethod.GET, "/api/notices", "/api/notices/**").permitAll()
                    // Public endpoint for inquiry creation
                    .requestMatchers(HttpMethod.POST, "/api/inquiries").permitAll()
                    // Admin endpoints
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    // All other API endpoints require authentication
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .userInfoEndpoint { it.userService(customOAuth2UserService) }
                    .successHandler(oAuth2SuccessHandler)
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        // Parse comma-separated origins from environment variable
        val origins = corsAllowedOrigins.split(",")
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .toMutableList()
        // Always include frontend URL if not already present
        if (!origins.contains(frontendUrl)) {
            origins.add(frontendUrl)
        }
        configuration.allowedOrigins = origins
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
