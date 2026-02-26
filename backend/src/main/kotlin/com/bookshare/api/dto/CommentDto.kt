package com.bookshare.api.dto

import com.bookshare.domain.book.Comment
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class CommentRequest(
    @field:NotBlank(message = "댓글 내용은 필수입니다.")
    val content: String
)

data class CommentResponse(
    val id: Long,
    val content: String,
    val createdBy: UserSummary,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(comment: Comment): CommentResponse {
            return CommentResponse(
                id = comment.id,
                content = comment.content,
                createdBy = UserSummary(
                    id = comment.createdBy.id,
                    username = comment.createdBy.username,
                    profileImageUrl = comment.createdBy.profileImageUrl
                ),
                createdAt = comment.createdAt,
                updatedAt = comment.updatedAt
            )
        }
    }
}
