package com.bookshare.api

import com.bookshare.domain.book.BookRepository
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.boot.info.BuildProperties
import org.springframework.core.env.Environment
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Optional

@Tag(name = "Health", description = "Health check endpoints")
@RestController
@RequestMapping("/api")
class HealthController(
    private val environment: Environment,
    private val buildProperties: Optional<BuildProperties>,
    private val bookRepository: BookRepository
) {

    @Operation(summary = "Health check", description = "Basic health check endpoint")
    @GetMapping("/health")
    fun health(): HealthResponse {
        return HealthResponse(
            status = "UP",
            timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            profile = environment.activeProfiles.joinToString(",").ifEmpty { "default" }
        )
    }

    @Operation(summary = "Get site stats", description = "Get site statistics including total book count")
    @GetMapping("/stats")
    fun stats(): StatsResponse {
        val totalBooks = bookRepository.countActiveBooks()
        return StatsResponse(totalBooks = totalBooks)
    }

    @Operation(summary = "Detailed health check", description = "Detailed health check with version info")
    @GetMapping("/health/info")
    fun healthInfo(): HealthInfoResponse {
        val props = buildProperties.orElse(null)
        return HealthInfoResponse(
            status = "UP",
            timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            profile = environment.activeProfiles.joinToString(",").ifEmpty { "default" },
            version = props?.version ?: "dev",
            name = props?.name ?: "bookshare-backend",
            javaVersion = System.getProperty("java.version"),
            kotlinVersion = KotlinVersion.CURRENT.toString()
        )
    }
}

data class HealthResponse(
    val status: String,
    val timestamp: String,
    val profile: String
)

data class StatsResponse(
    val totalBooks: Long
)

data class HealthInfoResponse(
    val status: String,
    val timestamp: String,
    val profile: String,
    val version: String,
    val name: String,
    val javaVersion: String,
    val kotlinVersion: String
)
