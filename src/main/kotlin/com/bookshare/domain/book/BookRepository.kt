package com.bookshare.domain.book

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface BookRepository : JpaRepository<Book, Long> {
    fun findByIsDeletedFalseOrderByUploadDateDesc(pageable: Pageable): Page<Book>

    fun findByUploadedByIdAndIsDeletedFalseOrderByUploadDateDesc(
        uploadedById: Long,
        pageable: Pageable
    ): Page<Book>

    fun findByIdAndIsDeletedFalse(id: Long): Book?

    @Query("SELECT COUNT(b) FROM Book b WHERE b.isDeleted = false")
    fun countActiveBooks(): Long
}
