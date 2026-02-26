package com.bookshare.api.dto

import com.bookshare.domain.inquiry.Inquiry
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class InquiryRequest(
    @field:NotBlank(message = "연락처는 필수입니다.")
    val contact: String,

    @field:NotBlank(message = "내용은 필수입니다.")
    val content: String
)

data class InquiryResponse(
    val id: Long,
    val contact: String,
    val content: String,
    val createdAt: LocalDateTime,
    val isConfirmed: Boolean
) {
    companion object {
        fun from(inquiry: Inquiry): InquiryResponse {
            return InquiryResponse(
                id = inquiry.id,
                contact = inquiry.contact,
                content = inquiry.content,
                createdAt = inquiry.createdAt,
                isConfirmed = inquiry.isConfirmed
            )
        }
    }
}
