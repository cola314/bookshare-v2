package com.bookshare.common.exception

import org.springframework.http.HttpStatus

enum class ErrorCode(
    val status: HttpStatus,
    val code: String,
    val message: String
) {
    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "C001", "잘못된 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C002", "서버 내부 오류가 발생했습니다."),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "A002", "접근 권한이 없습니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "사용자를 찾을 수 없습니다."),

    // Book
    BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "책을 찾을 수 없습니다."),
    NOT_BOOK_OWNER(HttpStatus.FORBIDDEN, "B002", "책의 소유자만 수정/삭제할 수 있습니다."),
    INVALID_ALADIN_URL(HttpStatus.BAD_REQUEST, "B003", "유효하지 않은 알라딘 URL입니다."),
    CRAWLING_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "B004", "책 정보를 가져오는데 실패했습니다."),
    ALADIN_SEARCH_FAILED(HttpStatus.BAD_GATEWAY, "B005", "알라딘 검색에 실패했습니다."),
    DUPLICATE_BOOK_LINK(HttpStatus.CONFLICT, "B006", "이미 등록된 책 링크입니다."),

    // Comment
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "CM001", "댓글을 찾을 수 없습니다."),
    NOT_COMMENT_OWNER(HttpStatus.FORBIDDEN, "CM002", "댓글의 작성자만 삭제할 수 있습니다."),

    // Notice
    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "N001", "공지사항을 찾을 수 없습니다."),

    // Inquiry
    INQUIRY_NOT_FOUND(HttpStatus.NOT_FOUND, "I001", "문의를 찾을 수 없습니다.")
}
