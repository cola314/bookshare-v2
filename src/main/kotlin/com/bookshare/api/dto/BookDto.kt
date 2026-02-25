package com.bookshare.api.dto

import com.bookshare.domain.book.Book
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class BookRequest(
    @field:NotBlank(message = "링크는 필수입니다.")
    val link: String,

    val comment: String? = null
)

data class BookUpdateRequest(
    val comment: String? = null
)

data class BookResponse(
    val id: Long,
    val title: String,
    val meta: String,
    val cover: String?,
    val link: String,
    val comment: String?,
    val uploadDate: LocalDateTime,
    val uploadedBy: UserSummary,
    val likeCount: Int,
    val commentCount: Int,
    val isLiked: Boolean
) {
    companion object {
        fun from(book: Book, commentCount: Int, isLiked: Boolean = false): BookResponse {
            return BookResponse(
                id = book.id,
                title = book.title,
                meta = book.meta,
                cover = book.cover,
                link = book.link,
                comment = book.comment,
                uploadDate = book.uploadDate,
                uploadedBy = UserSummary(
                    id = book.uploadedBy.id,
                    username = book.uploadedBy.username,
                    profileImageUrl = book.uploadedBy.profileImageUrl
                ),
                likeCount = book.likeCount(),
                commentCount = commentCount,
                isLiked = isLiked
            )
        }
    }
}

data class BookListResponse(
    val id: Long,
    val title: String,
    val meta: String,
    val cover: String?,
    val link: String,
    val comment: String?,
    val uploadDate: LocalDateTime,
    val uploadedBy: UserSummary,
    val likeCount: Int,
    val commentCount: Int
) {
    companion object {
        fun from(book: Book, commentCount: Int): BookListResponse {
            return BookListResponse(
                id = book.id,
                title = book.title,
                meta = book.meta,
                cover = book.cover,
                link = book.link,
                comment = book.comment,
                uploadDate = book.uploadDate,
                uploadedBy = UserSummary(
                    id = book.uploadedBy.id,
                    username = book.uploadedBy.username,
                    profileImageUrl = book.uploadedBy.profileImageUrl
                ),
                likeCount = book.likeCount(),
                commentCount = commentCount
            )
        }
    }
}

data class UserSummary(
    val id: Long,
    val username: String,
    val profileImageUrl: String?
)

data class AladinSearchBookResponse(
    val title: String,
    val meta: String,
    val cover: String?,
    val link: String,
    val isbn13: String,
    val source: String = "ALADIN"
)
