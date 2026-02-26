package com.bookshare.api.auth

import com.bookshare.config.jwt.JwtTokenProvider
import com.bookshare.domain.user.OAuthProvider
import com.bookshare.domain.user.User
import com.bookshare.domain.user.UserRepository
import com.bookshare.domain.user.UserRole
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.util.UUID

@Tag(name = "Auth", description = "Authentication API")
@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account with email and password"
    )
    @ApiResponses(
        ApiResponse(
            responseCode = "201",
            description = "Successfully registered",
            content = [Content(schema = Schema(implementation = RegisterResponse::class))]
        ),
        ApiResponse(responseCode = "400", description = "Invalid input or validation error"),
        ApiResponse(responseCode = "409", description = "Email already exists")
    )
    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<Any> {
        // Check if email already exists
        if (userRepository.existsByEmail(request.email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse("Email already exists"))
        }

        // Create new user
        val user = User(
            email = request.email,
            username = request.username,
            password = passwordEncoder.encode(request.password),
            nickname = request.nickname,
            provider = OAuthProvider.LOCAL,
            providerId = UUID.randomUUID().toString(),
            role = UserRole.USER
        )

        val savedUser = userRepository.save(user)

        // Generate JWT token
        val token = jwtTokenProvider.generateToken(savedUser)
        val refreshToken = jwtTokenProvider.generateRefreshToken(savedUser)

        return ResponseEntity.status(HttpStatus.CREATED).body(
            RegisterResponse(
                message = "Successfully registered",
                token = token,
                refreshToken = refreshToken,
                user = UserResponse.from(savedUser)
            )
        )
    }

    @Operation(
        summary = "Get current user",
        description = "Returns the currently authenticated user's information",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Successfully retrieved user info"),
        ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    )
    @GetMapping("/me")
    fun getCurrentUser(@AuthenticationPrincipal user: User?): ResponseEntity<UserResponse> {
        if (user == null) {
            return ResponseEntity.status(401).build()
        }
        return ResponseEntity.ok(UserResponse.from(user))
    }

    @Operation(
        summary = "Update current user profile",
        description = "Updates the currently authenticated user's username",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Successfully updated profile"),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "401", description = "Unauthorized"),
        ApiResponse(responseCode = "409", description = "Username already exists")
    )
    @PatchMapping("/me")
    fun updateCurrentUser(
        @AuthenticationPrincipal user: User?,
        @Valid @RequestBody request: UpdateUserRequest
    ): ResponseEntity<Any> {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse("Unauthorized"))
        }

        val username = request.username.trim()

        if (username.length < 2 || username.length > 50) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse("Username must be between 2 and 50 characters"))
        }

        if (user.username != username && userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse("Username already exists"))
        }

        user.username = username
        user.updatedAt = LocalDateTime.now()
        val savedUser = userRepository.save(user)

        return ResponseEntity.ok(UserResponse.from(savedUser))
    }

    @Operation(
        summary = "Logout",
        description = "Logout the current user. The client should delete the token from storage.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Successfully logged out")
    )
    @PostMapping("/logout")
    fun logout(): ResponseEntity<LogoutResponse> {
        // JWT is stateless, so logout is handled on the client side
        // This endpoint exists for consistency and potential future server-side token invalidation
        return ResponseEntity.ok(LogoutResponse("Successfully logged out. Please delete the token from client storage."))
    }

    @Operation(
        summary = "Login with email and password",
        description = "Authenticates a user with email and password and returns JWT tokens"
    )
    @ApiResponses(
        ApiResponse(
            responseCode = "200",
            description = "Successfully logged in",
            content = [Content(schema = Schema(implementation = LoginResponse::class))]
        ),
        ApiResponse(responseCode = "401", description = "Invalid email or password")
    )
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<Any> {
        val user = userRepository.findByEmail(request.email)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse("Invalid email or password"))

        // Check if user has a password (LOCAL provider)
        if (user.password == null || !passwordEncoder.matches(request.password, user.password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse("Invalid email or password"))
        }

        val token = jwtTokenProvider.generateToken(user)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user)

        return ResponseEntity.ok(
            LoginResponse(
                accessToken = token,
                refreshToken = refreshToken,
                user = UserResponse.from(user)
            )
        )
    }
}

data class UserResponse(
    val id: Long,
    val email: String,
    val username: String,
    val profileImageUrl: String?,
    val role: String
) {
    companion object {
        fun from(user: User): UserResponse {
            return UserResponse(
                id = user.id,
                email = user.email,
                username = user.username,
                profileImageUrl = user.profileImageUrl,
                role = user.role.name
            )
        }
    }
}

data class LogoutResponse(
    val message: String
)

data class RegisterRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    val password: String,

    @field:NotBlank(message = "Username is required")
    @field:Size(min = 2, max = 50, message = "Username must be between 2 and 50 characters")
    val username: String,

    @field:Size(max = 50, message = "Nickname must be at most 50 characters")
    val nickname: String? = null
)

data class RegisterResponse(
    val message: String,
    val token: String,
    val refreshToken: String,
    val user: UserResponse
)

data class ErrorResponse(
    val message: String
)

data class LoginRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

data class UpdateUserRequest(
    @field:NotBlank(message = "Username is required")
    @field:Size(min = 2, max = 50, message = "Username must be between 2 and 50 characters")
    val username: String
)

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserResponse
)
