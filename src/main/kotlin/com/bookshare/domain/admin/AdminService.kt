package com.bookshare.domain.admin

import com.bookshare.domain.book.BookRepository
import com.bookshare.domain.inquiry.InquiryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AdminService(
    private val bookRepository: BookRepository,
    private val inquiryRepository: InquiryRepository
) {

    /**
     * 대시보드 통계
     */
    fun getDashboard(): DashboardStats {
        val totalBooks = bookRepository.countActiveBooks()
        val pendingInquiries = inquiryRepository.countByIsConfirmedFalse()
        val confirmedInquiries = inquiryRepository.countByIsConfirmedTrue()

        return DashboardStats(
            totalBooks = totalBooks,
            pendingInquiries = pendingInquiries,
            confirmedInquiries = confirmedInquiries
        )
    }
}

data class DashboardStats(
    val totalBooks: Long,
    val pendingInquiries: Long,
    val confirmedInquiries: Long
)
