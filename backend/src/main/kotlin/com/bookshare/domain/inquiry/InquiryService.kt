package com.bookshare.domain.inquiry

import com.bookshare.common.exception.BusinessException
import com.bookshare.common.exception.ErrorCode
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class InquiryService(
    private val inquiryRepository: InquiryRepository
) {

    /**
     * 문의 등록 (비로그인도 가능)
     */
    @Transactional
    fun createInquiry(contact: String, content: String): Inquiry {
        val inquiry = Inquiry(
            contact = contact,
            content = content
        )
        return inquiryRepository.save(inquiry)
    }

    /**
     * 전체 문의 목록 (ADMIN만)
     */
    fun getInquiries(): List<Inquiry> {
        return inquiryRepository.findAll().sortedByDescending { it.createdAt }
    }

    /**
     * 문의 처리 완료 (ADMIN만)
     */
    @Transactional
    fun confirmInquiry(id: Long): Inquiry {
        val inquiry = inquiryRepository.findById(id).orElseThrow {
            BusinessException(ErrorCode.INQUIRY_NOT_FOUND)
        }
        inquiry.isConfirmed = true
        return inquiry
    }
}
