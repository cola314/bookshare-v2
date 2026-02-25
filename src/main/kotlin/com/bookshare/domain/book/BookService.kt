package com.bookshare.domain.book

import com.bookshare.api.dto.AladinSearchBookResponse
import com.bookshare.api.dto.BookListResponse
import com.bookshare.api.dto.BookResponse
import com.bookshare.common.exception.BusinessException
import com.bookshare.common.exception.ErrorCode
import com.bookshare.domain.user.User
import com.bookshare.domain.user.UserRepository
import com.bookshare.infra.aladin.AladinSearchClient
import com.bookshare.infra.crawler.BookCrawler
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class BookService(
    private val bookRepository: BookRepository,
    private val commentRepository: CommentRepository,
    private val userRepository: UserRepository,
    private val bookCrawler: BookCrawler,
    private val aladinSearchClient: AladinSearchClient
) {

    /**
     * 책 목록 조회 (페이징, 삭제되지 않은 것만)
     */
    fun getBooks(pageable: Pageable): Page<BookListResponse> {
        return bookRepository.findByIsDeletedFalseOrderByUploadDateDesc(pageable)
            .map { BookListResponse.from(it, commentRepository.countByBookIdAndIsDeletedFalse(it.id)) }
    }

    /**
     * 사용자별 책 목록 조회
     */
    fun getBooksByUser(userId: Long, pageable: Pageable): Page<BookListResponse> {
        return bookRepository.findByUploadedByIdAndIsDeletedFalseOrderByUploadDateDesc(userId, pageable)
            .map { BookListResponse.from(it, commentRepository.countByBookIdAndIsDeletedFalse(it.id)) }
    }

    /**
     * 알라딘 웹사이트 키워드 검색
     */
    fun searchAladinBooks(query: String, pageable: Pageable): Page<AladinSearchBookResponse> {
        if (query.isBlank()) {
            throw BusinessException(ErrorCode.INVALID_INPUT, "query는 필수입니다.")
        }
        return aladinSearchClient.searchBooks(query.trim(), pageable)
    }

    /**
     * 책 상세 조회 (댓글 수, 좋아요 수 포함)
     */
    fun getBook(id: Long, currentUserId: Long?): BookResponse {
        val book = findBookById(id)
        val commentCount = commentRepository.findByBookIdAndIsDeletedFalseOrderByCreatedAtDesc(id).size
        val isLiked = currentUserId?.let { userId ->
            userRepository.findById(userId).map { book.isLikedBy(it) }.orElse(false)
        } ?: false
        return BookResponse.from(book, commentCount, isLiked)
    }

    /**
     * 책 등록 (크롤링 후 저장)
     */
    @Transactional
    fun createBook(userId: Long, aladinUrl: String, comment: String?): BookResponse {
        val user = findUserById(userId)
        val bookInfo = bookCrawler.crawlBookInfo(aladinUrl, user)

        if (bookRepository.existsByLinkAndIsDeletedFalse(bookInfo.link)) {
            throw BusinessException(ErrorCode.DUPLICATE_BOOK_LINK)
        }

        val book = Book(
            title = bookInfo.title,
            meta = bookInfo.meta,
            cover = bookInfo.coverUrl,
            link = bookInfo.link,
            comment = comment,
            uploadedBy = user
        )

        val savedBook = bookRepository.save(book)
        return BookResponse.from(savedBook, 0, false)
    }

    /**
     * 책 수정 (본인만)
     */
    @Transactional
    fun updateBook(userId: Long, bookId: Long, comment: String?): BookResponse {
        val book = findBookById(bookId)
        validateOwnership(book, userId)

        book.comment = comment
        val commentCount = commentRepository.findByBookIdAndIsDeletedFalseOrderByCreatedAtDesc(bookId).size
        val isLiked = userRepository.findById(userId).map { book.isLikedBy(it) }.orElse(false)
        return BookResponse.from(book, commentCount, isLiked)
    }

    /**
     * 책 삭제 (소프트 삭제, 본인만)
     */
    @Transactional
    fun deleteBook(userId: Long, bookId: Long) {
        val book = findBookById(bookId)
        validateOwnership(book, userId)
        book.isDeleted = true
    }

    /**
     * 좋아요 토글
     */
    @Transactional
    fun toggleLike(userId: Long, bookId: Long): Boolean {
        val book = findBookById(bookId)
        val user = findUserById(userId)

        return if (book.isLikedBy(user)) {
            book.removeLike(user)
            false
        } else {
            book.addLike(user)
            true
        }
    }

    private fun findBookById(id: Long): Book {
        return bookRepository.findByIdAndIsDeletedFalse(id)
            ?: throw BusinessException(ErrorCode.BOOK_NOT_FOUND)
    }

    private fun findUserById(id: Long): User {
        return userRepository.findById(id).orElseThrow {
            BusinessException(ErrorCode.USER_NOT_FOUND)
        }
    }

    private fun validateOwnership(book: Book, userId: Long) {
        if (book.uploadedBy.id != userId) {
            throw BusinessException(ErrorCode.NOT_BOOK_OWNER)
        }
    }
}
