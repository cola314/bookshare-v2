package com.bookshare.domain.notice

import com.bookshare.common.exception.BusinessException
import com.bookshare.common.exception.ErrorCode
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class NoticeService(
    private val noticeRepository: NoticeRepository
) {

    /**
     * 공지 목록 조회 (상단고정 먼저, 최신순)
     */
    fun getNotices(pageable: Pageable): Page<Notice> {
        return noticeRepository.findAllActiveOrderByTopFixedAndCreatedAt(pageable)
    }

    /**
     * 최근 5개 공지 조회
     */
    fun getRecentNotices(): List<Notice> {
        return noticeRepository.findTop5ByIsDeletedFalseOrderByCreatedAtDesc()
    }

    /**
     * 공지 상세 조회
     */
    fun getNotice(id: Long): Notice {
        return findNoticeById(id)
    }

    /**
     * 공지 생성 (ADMIN만)
     */
    @Transactional
    fun createNotice(title: String, content: String, topFixed: Boolean): Notice {
        val notice = Notice(
            title = title,
            content = content,
            topFixed = topFixed
        )
        return noticeRepository.save(notice)
    }

    /**
     * 공지 수정 (ADMIN만)
     */
    @Transactional
    fun updateNotice(id: Long, title: String, content: String, topFixed: Boolean): Notice {
        val notice = findNoticeById(id)
        notice.title = title
        notice.content = content
        notice.topFixed = topFixed
        notice.updatedAt = LocalDateTime.now()
        return notice
    }

    /**
     * 공지 삭제 (ADMIN만, 소프트 삭제)
     */
    @Transactional
    fun deleteNotice(id: Long) {
        val notice = findNoticeById(id)
        notice.isDeleted = true
    }

    private fun findNoticeById(id: Long): Notice {
        val notice = noticeRepository.findById(id).orElseThrow {
            BusinessException(ErrorCode.NOTICE_NOT_FOUND)
        }
        if (notice.isDeleted) {
            throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)
        }
        return notice
    }
}
