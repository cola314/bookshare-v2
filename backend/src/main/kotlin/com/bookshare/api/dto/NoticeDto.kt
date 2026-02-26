package com.bookshare.api.dto

import com.bookshare.domain.notice.Notice
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class NoticeRequest(
    @field:NotBlank(message = "제목은 필수입니다.")
    val title: String,

    @field:NotBlank(message = "내용은 필수입니다.")
    val content: String,

    val topFixed: Boolean = false
)

data class NoticeResponse(
    val id: Long,
    val title: String,
    val content: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val topFixed: Boolean
) {
    companion object {
        fun from(notice: Notice): NoticeResponse {
            return NoticeResponse(
                id = notice.id,
                title = notice.title,
                content = notice.content,
                createdAt = notice.createdAt,
                updatedAt = notice.updatedAt,
                topFixed = notice.topFixed
            )
        }
    }
}

data class NoticeListResponse(
    val id: Long,
    val title: String,
    val content: String,
    val createdAt: LocalDateTime,
    val topFixed: Boolean
) {
    companion object {
        fun from(notice: Notice): NoticeListResponse {
            return NoticeListResponse(
                id = notice.id,
                title = notice.title,
                content = notice.content,
                createdAt = notice.createdAt,
                topFixed = notice.topFixed
            )
        }
    }
}
