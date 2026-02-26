package com.bookshare.domain.book

import com.bookshare.api.dto.CommentResponse
import com.bookshare.common.exception.BusinessException
import com.bookshare.common.exception.ErrorCode
import com.bookshare.domain.user.User
import com.bookshare.domain.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class CommentService(
    private val commentRepository: CommentRepository,
    private val bookRepository: BookRepository,
    private val userRepository: UserRepository
) {

    /**
     * 댓글 목록 조회
     */
    fun getComments(bookId: Long): List<CommentResponse> {
        // 책 존재 여부 확인
        findBookById(bookId)
        return commentRepository.findByBookIdAndIsDeletedFalseOrderByCreatedAtDesc(bookId)
            .map { CommentResponse.from(it) }
    }

    /**
     * 댓글 작성
     */
    @Transactional
    fun createComment(userId: Long, bookId: Long, content: String): CommentResponse {
        val user = findUserById(userId)
        val book = findBookById(bookId)

        val comment = Comment(
            book = book,
            content = content,
            createdBy = user
        )

        val savedComment = commentRepository.save(comment)
        return CommentResponse.from(savedComment)
    }

    /**
     * 댓글 삭제 (본인만)
     */
    @Transactional
    fun deleteComment(userId: Long, commentId: Long) {
        val comment = findCommentById(commentId)
        validateOwnership(comment, userId)
        comment.isDeleted = true
    }

    private fun findBookById(id: Long): Book {
        return bookRepository.findByIdAndIsDeletedFalse(id)
            ?: throw BusinessException(ErrorCode.BOOK_NOT_FOUND)
    }

    private fun findCommentById(id: Long): Comment {
        return commentRepository.findByIdAndIsDeletedFalse(id)
            ?: throw BusinessException(ErrorCode.COMMENT_NOT_FOUND)
    }

    private fun findUserById(id: Long): User {
        return userRepository.findById(id).orElseThrow {
            BusinessException(ErrorCode.USER_NOT_FOUND)
        }
    }

    private fun validateOwnership(comment: Comment, userId: Long) {
        if (comment.createdBy.id != userId) {
            throw BusinessException(ErrorCode.NOT_COMMENT_OWNER)
        }
    }
}
