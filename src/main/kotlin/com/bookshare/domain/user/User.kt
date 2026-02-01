package com.bookshare.domain.user

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    var email: String,

    @Column(nullable = false)
    var username: String,

    @Column
    var profileImageUrl: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var provider: OAuthProvider = OAuthProvider.GOOGLE,

    @Column(nullable = false)
    var providerId: String,

    @Column
    var password: String? = null,

    @Column
    var nickname: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: UserRole = UserRole.USER,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun isAdmin(): Boolean = role == UserRole.ADMIN
}

enum class OAuthProvider {
    GOOGLE, LOCAL
}

enum class UserRole {
    USER, ADMIN
}
