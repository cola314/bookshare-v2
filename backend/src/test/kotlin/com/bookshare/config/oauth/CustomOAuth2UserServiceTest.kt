package com.bookshare.config.oauth

import com.bookshare.domain.user.OAuthProvider
import com.bookshare.domain.user.User
import com.bookshare.domain.user.UserRepository
import com.bookshare.domain.user.UserRole
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.test.context.TestPropertySource

@DataJpaTest
@TestPropertySource(properties = ["spring.sql.init.mode=never"])
class CustomOAuth2UserServiceTest @Autowired constructor(
    private val userRepository: UserRepository
) {

    private val service by lazy { CustomOAuth2UserService(userRepository) }

    @Test
    fun `keeps customized username for existing oauth user`() {
        val existingUser = userRepository.save(
            User(
                email = "before@example.com",
                username = "my-custom-name",
                profileImageUrl = "before-image",
                provider = OAuthProvider.GOOGLE,
                providerId = "google-provider-id",
                role = UserRole.USER
            )
        )

        val oauthUserInfo = object : OAuth2UserInfo {
            override val id: String = "google-provider-id"
            override val name: String = "Google Display Name"
            override val email: String = "after@example.com"
            override val imageUrl: String? = "after-image"
        }

        invokeFindOrCreateUser(OAuthProvider.GOOGLE, oauthUserInfo)

        val updatedUser = userRepository.findById(existingUser.id).orElseThrow()

        assertThat(updatedUser.username).isEqualTo("my-custom-name")
        assertThat(updatedUser.email).isEqualTo("after@example.com")
        assertThat(updatedUser.profileImageUrl).isEqualTo("after-image")
    }

    @Test
    fun `uses oauth name when creating new oauth user`() {
        val oauthUserInfo = object : OAuth2UserInfo {
            override val id: String = "new-google-provider-id"
            override val name: String = "Fresh Google Name"
            override val email: String = "new@example.com"
            override val imageUrl: String? = "new-image"
        }

        val createdUser = invokeFindOrCreateUser(OAuthProvider.GOOGLE, oauthUserInfo)
        val savedUser = userRepository.findById(createdUser.id).orElseThrow()

        assertThat(savedUser.username).isEqualTo("Fresh Google Name")
        assertThat(savedUser.email).isEqualTo("new@example.com")
        assertThat(savedUser.profileImageUrl).isEqualTo("new-image")
        assertThat(savedUser.providerId).isEqualTo("new-google-provider-id")
    }

    private fun invokeFindOrCreateUser(provider: OAuthProvider, userInfo: OAuth2UserInfo): User {
        val method = CustomOAuth2UserService::class.java.getDeclaredMethod(
            "findOrCreateUser",
            OAuthProvider::class.java,
            OAuth2UserInfo::class.java
        )
        method.isAccessible = true
        return method.invoke(service, provider, userInfo) as User
    }
}
