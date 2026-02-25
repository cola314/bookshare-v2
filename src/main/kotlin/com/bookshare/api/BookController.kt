package com.bookshare.api

import com.bookshare.api.dto.*
import com.bookshare.domain.book.BookService
import com.bookshare.domain.user.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@Tag(name = "Books", description = "Book API")
@RestController
@RequestMapping("/api")
@Validated
class BookController(
    private val bookService: BookService
) {

    @Operation(summary = "책 목록 조회", description = "페이징된 책 목록을 조회합니다.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공")
    )
    @GetMapping("/books")
    fun getBooks(
        @PageableDefault(size = 20, sort = ["uploadDate"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<PageResponse<BookListResponse>> {
        val result = bookService.getBooks(pageable)
        return ResponseEntity.ok(PageResponse.from(result))
    }

    @Operation(summary = "사용자별 책 목록 조회", description = "특정 사용자가 등록한 책 목록을 조회합니다.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공")
    )
    @GetMapping("/users/{userId}/books")
    fun getBooksByUser(
        @Parameter(description = "사용자 ID") @PathVariable userId: Long,
        @PageableDefault(size = 20, sort = ["uploadDate"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<PageResponse<BookListResponse>> {
        val result = bookService.getBooksByUser(userId, pageable)
        return ResponseEntity.ok(PageResponse.from(result))
    }

    @Operation(summary = "알라딘 키워드 검색", description = "알라딘 웹사이트 검색 결과를 크롤링해 책을 검색합니다.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공"),
        ApiResponse(responseCode = "400", description = "query 파라미터 오류"),
        ApiResponse(responseCode = "502", description = "알라딘 웹사이트 검색 실패")
    )
    @GetMapping("/books/aladin-search")
    fun searchAladinBooks(
        @Parameter(description = "검색어")
        @RequestParam("query")
        @NotBlank(message = "query는 필수입니다.")
        query: String,
        @PageableDefault(size = 20)
        pageable: Pageable
    ): ResponseEntity<PageResponse<AladinSearchBookResponse>> {
        val result = bookService.searchAladinBooks(query, pageable)
        return ResponseEntity.ok(PageResponse.from(result))
    }

    @Operation(summary = "알라딘 자동완성", description = "알라딘 비공식 자동완성 엔드포인트 기반으로 검색어 추천 목록을 조회합니다.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공"),
        ApiResponse(responseCode = "400", description = "query 파라미터 오류"),
        ApiResponse(responseCode = "502", description = "알라딘 자동완성 조회 실패")
    )
    @GetMapping("/books/aladin-autocomplete")
    fun autocompleteAladinBooks(
        @Parameter(description = "검색어")
        @RequestParam("query")
        @NotBlank(message = "query는 필수입니다.")
        query: String,
        @RequestParam(name = "size", defaultValue = "10") size: Int
    ): ResponseEntity<List<AladinSearchBookResponse>> {
        val result = bookService.autocompleteAladinBooks(query, size)
        return ResponseEntity.ok(result)
    }

    @Operation(
        summary = "책 상세 조회",
        description = "책의 상세 정보를 조회합니다. (댓글 수, 좋아요 수 포함)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공"),
        ApiResponse(responseCode = "404", description = "책을 찾을 수 없음")
    )
    @GetMapping("/books/{id}")
    fun getBook(
        @Parameter(description = "책 ID") @PathVariable id: Long,
        @AuthenticationPrincipal user: User?
    ): ResponseEntity<BookResponse> {
        val result = bookService.getBook(id, user?.id)
        return ResponseEntity.ok(result)
    }

    @Operation(
        summary = "책 등록",
        description = "알라딘 URL을 통해 책을 등록합니다.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "등록 성공"),
        ApiResponse(responseCode = "400", description = "잘못된 URL 또는 크롤링 실패"),
        ApiResponse(responseCode = "401", description = "인증 필요")
    )
    @PostMapping("/books")
    fun createBook(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: BookRequest
    ): ResponseEntity<BookResponse> {
        val result = bookService.createBook(user.id, request.link, request.comment)
        return ResponseEntity.status(HttpStatus.CREATED).body(result)
    }

    @Operation(
        summary = "책 수정",
        description = "책의 코멘트를 수정합니다. (본인만 가능)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "수정 성공"),
        ApiResponse(responseCode = "403", description = "권한 없음"),
        ApiResponse(responseCode = "404", description = "책을 찾을 수 없음")
    )
    @PutMapping("/books/{id}")
    fun updateBook(
        @AuthenticationPrincipal user: User,
        @Parameter(description = "책 ID") @PathVariable id: Long,
        @Valid @RequestBody request: BookUpdateRequest
    ): ResponseEntity<BookResponse> {
        val result = bookService.updateBook(user.id, id, request.comment)
        return ResponseEntity.ok(result)
    }

    @Operation(
        summary = "책 삭제",
        description = "책을 삭제합니다. (본인만 가능, 소프트 삭제)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "삭제 성공"),
        ApiResponse(responseCode = "403", description = "권한 없음"),
        ApiResponse(responseCode = "404", description = "책을 찾을 수 없음")
    )
    @DeleteMapping("/books/{id}")
    fun deleteBook(
        @AuthenticationPrincipal user: User,
        @Parameter(description = "책 ID") @PathVariable id: Long
    ): ResponseEntity<Void> {
        bookService.deleteBook(user.id, id)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "좋아요 토글",
        description = "책에 좋아요를 추가하거나 취소합니다.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "토글 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "404", description = "책을 찾을 수 없음")
    )
    @PostMapping("/books/{id}/like")
    fun toggleLike(
        @AuthenticationPrincipal user: User,
        @Parameter(description = "책 ID") @PathVariable id: Long
    ): ResponseEntity<LikeResponse> {
        val isLiked = bookService.toggleLike(user.id, id)
        return ResponseEntity.ok(LikeResponse(isLiked))
    }
}

data class LikeResponse(val liked: Boolean)
