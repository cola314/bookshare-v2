package com.bookshare.config.oauth

import com.bookshare.domain.user.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.user.OAuth2User

class OAuth2UserPrincipal(
    val user: User,
    private val attributes: Map<String, Any>
) : OAuth2User {

    override fun getAttributes(): Map<String, Any> = attributes

    override fun getAuthorities(): Collection<GrantedAuthority> {
        return listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))
    }

    override fun getName(): String = user.id.toString()
}
