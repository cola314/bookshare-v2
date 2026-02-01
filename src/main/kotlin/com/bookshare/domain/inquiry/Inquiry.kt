package com.bookshare.domain.inquiry

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "inquiries")
class Inquiry(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var contact: String,  // 문의자 연락처

    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String,  // 문의 내용

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var isConfirmed: Boolean = false  // 처리 완료 여부
)
