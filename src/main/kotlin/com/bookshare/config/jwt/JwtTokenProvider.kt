package com.bookshare.config.jwt

import com.bookshare.domain.user.User
import io.jsonwebtoken.*
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}")
    private val jwtSecret: String,

    @Value("\${jwt.expiration}")
    private val jwtExpiration: Long,

    @Value("\${jwt.refresh-expiration}")
    private val refreshExpiration: Long
) {
    private val logger = LoggerFactory.getLogger(JwtTokenProvider::class.java)

    private val key: SecretKey by lazy {
        val keyBytes = if (jwtSecret.length < 32) {
            // If secret is too short, pad it
            jwtSecret.padEnd(32, '0').toByteArray()
        } else {
            jwtSecret.toByteArray()
        }
        Keys.hmacShaKeyFor(keyBytes)
    }

    fun generateToken(user: User): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpiration)

        return Jwts.builder()
            .subject(user.id.toString())
            .claim("email", user.email)
            .claim("username", user.username)
            .claim("role", user.role.name)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact()
    }

    fun generateRefreshToken(user: User): String {
        val now = Date()
        val expiryDate = Date(now.time + refreshExpiration)

        return Jwts.builder()
            .subject(user.id.toString())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact()
    }

    fun getUserIdFromToken(token: String): Long {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload

        return claims.subject.toLong()
    }

    fun validateToken(token: String): Boolean {
        try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
            return true
        } catch (ex: MalformedJwtException) {
            logger.error("Invalid JWT token")
        } catch (ex: ExpiredJwtException) {
            logger.error("Expired JWT token")
        } catch (ex: UnsupportedJwtException) {
            logger.error("Unsupported JWT token")
        } catch (ex: IllegalArgumentException) {
            logger.error("JWT claims string is empty")
        } catch (ex: Exception) {
            logger.error("JWT token validation error: ${ex.message}")
        }
        return false
    }
}
