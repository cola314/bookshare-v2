package com.bookshare.api.dto

import com.bookshare.domain.admin.DashboardStats

data class DashboardResponse(
    val totalBooks: Long,
    val pendingInquiries: Long,
    val confirmedInquiries: Long
) {
    companion object {
        fun from(stats: DashboardStats): DashboardResponse {
            return DashboardResponse(
                totalBooks = stats.totalBooks,
                pendingInquiries = stats.pendingInquiries,
                confirmedInquiries = stats.confirmedInquiries
            )
        }
    }
}
