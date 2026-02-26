package com.bookshare.domain.book

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByBookIdAndIsDeletedFalseOrderByCreatedAtDesc(bookId: Long): List<Comment>

    fun countByBookIdAndIsDeletedFalse(bookId: Long): Int

    fun findByIdAndIsDeletedFalse(id: Long): Comment?
}
