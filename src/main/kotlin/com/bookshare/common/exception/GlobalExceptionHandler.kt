package com.bookshare.common.exception

import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(e: BusinessException): ResponseEntity<ErrorResponse> {
        log.warn("BusinessException: ${e.errorCode.code} - ${e.message}")
        return ResponseEntity
            .status(e.errorCode.status)
            .body(ErrorResponse.of(e.errorCode, e.message))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(e: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        log.warn("Validation error: ${e.message}")
        val message = e.bindingResult.fieldErrors
            .joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
        return ResponseEntity
            .status(ErrorCode.INVALID_INPUT.status)
            .body(ErrorResponse.of(ErrorCode.INVALID_INPUT, message))
    }

    @ExceptionHandler(Exception::class)
    fun handleException(e: Exception): ResponseEntity<ErrorResponse> {
        log.error("Unexpected error", e)
        return ResponseEntity
            .status(ErrorCode.INTERNAL_SERVER_ERROR.status)
            .body(ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR))
    }
}

data class ErrorResponse(
    val code: String,
    val message: String
) {
    companion object {
        fun of(errorCode: ErrorCode, message: String? = null) = ErrorResponse(
            code = errorCode.code,
            message = message ?: errorCode.message
        )
    }
}
