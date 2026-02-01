package com.bookshare.config.oauth

import com.bookshare.domain.user.OAuthProvider
import com.bookshare.domain.user.User
import com.bookshare.domain.user.UserRepository
import com.bookshare.domain.user.UserRole
import org.slf4j.LoggerFactory
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

@Service
class CustomOAuth2UserService(
    private val userRepository: UserRepository
) : DefaultOAuth2UserService() {

    private val logger = LoggerFactory.getLogger(CustomOAuth2UserService::class.java)

    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        val oauth2User = super.loadUser(userRequest)
        val registrationId = userRequest.clientRegistration.registrationId

        logger.debug("OAuth2 login attempt: provider=$registrationId")

        val provider = when (registrationId.lowercase()) {
            "google" -> OAuthProvider.GOOGLE
            else -> throw IllegalArgumentException("Unsupported OAuth provider: $registrationId")
        }

        val oAuth2UserInfo = extractOAuth2UserInfo(registrationId, oauth2User.attributes)
        val user = findOrCreateUser(provider, oAuth2UserInfo)

        return OAuth2UserPrincipal(user, oauth2User.attributes)
    }

    private fun extractOAuth2UserInfo(registrationId: String, attributes: Map<String, Any>): OAuth2UserInfo {
        return when (registrationId.lowercase()) {
            "google" -> GoogleOAuth2UserInfo(attributes)
            else -> throw IllegalArgumentException("Unsupported OAuth provider: $registrationId")
        }
    }

    private fun findOrCreateUser(provider: OAuthProvider, userInfo: OAuth2UserInfo): User {
        val existingUser = userRepository.findByProviderAndProviderId(provider, userInfo.id)

        return if (existingUser != null) {
            // Update existing user info
            existingUser.apply {
                username = userInfo.name
                email = userInfo.email
                profileImageUrl = userInfo.imageUrl
                updatedAt = java.time.LocalDateTime.now()
            }
            userRepository.save(existingUser)
        } else {
            // Create new user
            val newUser = User(
                email = userInfo.email,
                username = userInfo.name,
                profileImageUrl = userInfo.imageUrl,
                provider = provider,
                providerId = userInfo.id,
                role = UserRole.USER
            )
            userRepository.save(newUser)
        }
    }
}

interface OAuth2UserInfo {
    val id: String
    val name: String
    val email: String
    val imageUrl: String?
}

class GoogleOAuth2UserInfo(private val attributes: Map<String, Any>) : OAuth2UserInfo {
    override val id: String
        get() = attributes["sub"] as String

    override val name: String
        get() = attributes["name"] as? String ?: ""

    override val email: String
        get() = attributes["email"] as? String ?: ""

    override val imageUrl: String?
        get() = attributes["picture"] as? String
}
