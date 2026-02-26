package com.bookshare.domain.notice

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notices")
class Notice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var title: String,

    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var topFixed: Boolean = false,  // 상단 고정 여부

    @Column(nullable = false)
    var isDeleted: Boolean = false
)
