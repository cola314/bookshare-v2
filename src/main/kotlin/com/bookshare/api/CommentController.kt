package com.bookshare.api

import com.bookshare.api.dto.CommentRequest
import com.bookshare.api.dto.CommentResponse
import com.bookshare.domain.book.CommentService
import com.bookshare.domain.user.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@Tag(name = "Comments", description = "Comment API")
@RestController
@RequestMapping("/api")
class CommentController(
    private val commentService: CommentService
) {

    @Operation(summary = "댓글 목록 조회", description = "책에 달린 댓글 목록을 조회합니다.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공"),
        ApiResponse(responseCode = "404", description = "책을 찾을 수 없음")
    )
    @GetMapping("/books/{bookId}/comments")
    fun getComments(
        @Parameter(description = "책 ID") @PathVariable bookId: Long
    ): ResponseEntity<List<CommentResponse>> {
        val result = commentService.getComments(bookId)
        return ResponseEntity.ok(result)
    }

    @Operation(
        summary = "댓글 작성",
        description = "책에 댓글을 작성합니다.",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "작성 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "404", description = "책을 찾을 수 없음")
    )
    @PostMapping("/books/{bookId}/comments")
    fun createComment(
        @AuthenticationPrincipal user: User,
        @Parameter(description = "책 ID") @PathVariable bookId: Long,
        @Valid @RequestBody request: CommentRequest
    ): ResponseEntity<CommentResponse> {
        val result = commentService.createComment(user.id, bookId, request.content)
        return ResponseEntity.status(HttpStatus.CREATED).body(result)
    }

    @Operation(
        summary = "댓글 삭제",
        description = "댓글을 삭제합니다. (본인만 가능)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "삭제 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "403", description = "권한 없음"),
        ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    )
    @DeleteMapping("/comments/{id}")
    fun deleteComment(
        @AuthenticationPrincipal user: User,
        @Parameter(description = "댓글 ID") @PathVariable id: Long
    ): ResponseEntity<Void> {
        commentService.deleteComment(user.id, id)
        return ResponseEntity.noContent().build()
    }
}
