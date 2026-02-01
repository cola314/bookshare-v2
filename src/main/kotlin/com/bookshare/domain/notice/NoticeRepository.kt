package com.bookshare.domain.notice

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface NoticeRepository : JpaRepository<Notice, Long> {
    @Query("""
        SELECT n FROM Notice n
        WHERE n.isDeleted = false
        ORDER BY n.topFixed DESC, n.createdAt DESC
    """)
    fun findAllActiveOrderByTopFixedAndCreatedAt(pageable: Pageable): Page<Notice>

    fun findTop5ByIsDeletedFalseOrderByCreatedAtDesc(): List<Notice>
}
