package com.bookshare.domain.inquiry

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface InquiryRepository : JpaRepository<Inquiry, Long> {
    fun countByIsConfirmedFalse(): Long

    fun countByIsConfirmedTrue(): Long
}
