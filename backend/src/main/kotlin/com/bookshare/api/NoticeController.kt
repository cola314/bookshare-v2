package com.bookshare.api

import com.bookshare.api.dto.NoticeListResponse
import com.bookshare.api.dto.NoticeRequest
import com.bookshare.api.dto.NoticeResponse
import com.bookshare.api.dto.PageResponse
import com.bookshare.domain.notice.NoticeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@Tag(name = "Notices", description = "Notice API")
@RestController
@RequestMapping("/api/notices")
class NoticeController(
    private val noticeService: NoticeService
) {

    @Operation(summary = "공지 목록 조회", description = "페이징된 공지 목록을 조회합니다. (상단고정 먼저, 최신순)")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공")
    )
    @GetMapping
    fun getNotices(
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<PageResponse<NoticeListResponse>> {
        val result = noticeService.getNotices(pageable)
            .map { NoticeListResponse.from(it) }
        return ResponseEntity.ok(PageResponse.from(result))
    }

    @Operation(summary = "최근 공지 조회", description = "최근 5개의 공지를 조회합니다.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공")
    )
    @GetMapping("/recent")
    fun getRecentNotices(): ResponseEntity<List<NoticeListResponse>> {
        val result = noticeService.getRecentNotices()
            .map { NoticeListResponse.from(it) }
        return ResponseEntity.ok(result)
    }

    @Operation(summary = "공지 상세 조회", description = "공지의 상세 정보를 조회합니다.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공"),
        ApiResponse(responseCode = "404", description = "공지를 찾을 수 없음")
    )
    @GetMapping("/{id}")
    fun getNotice(
        @Parameter(description = "공지 ID") @PathVariable id: Long
    ): ResponseEntity<NoticeResponse> {
        val result = noticeService.getNotice(id)
        return ResponseEntity.ok(NoticeResponse.from(result))
    }

    @Operation(
        summary = "공지 생성",
        description = "새로운 공지를 생성합니다. (ADMIN 권한 필요)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "생성 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "403", description = "권한 없음")
    )
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun createNotice(
        @Valid @RequestBody request: NoticeRequest
    ): ResponseEntity<NoticeResponse> {
        val result = noticeService.createNotice(request.title, request.content, request.topFixed)
        return ResponseEntity.status(HttpStatus.CREATED).body(NoticeResponse.from(result))
    }

    @Operation(
        summary = "공지 수정",
        description = "공지를 수정합니다. (ADMIN 권한 필요)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "수정 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "403", description = "권한 없음"),
        ApiResponse(responseCode = "404", description = "공지를 찾을 수 없음")
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun updateNotice(
        @Parameter(description = "공지 ID") @PathVariable id: Long,
        @Valid @RequestBody request: NoticeRequest
    ): ResponseEntity<NoticeResponse> {
        val result = noticeService.updateNotice(id, request.title, request.content, request.topFixed)
        return ResponseEntity.ok(NoticeResponse.from(result))
    }

    @Operation(
        summary = "공지 삭제",
        description = "공지를 삭제합니다. (ADMIN 권한 필요, 소프트 삭제)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "삭제 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "403", description = "권한 없음"),
        ApiResponse(responseCode = "404", description = "공지를 찾을 수 없음")
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteNotice(
        @Parameter(description = "공지 ID") @PathVariable id: Long
    ): ResponseEntity<Void> {
        noticeService.deleteNotice(id)
        return ResponseEntity.noContent().build()
    }
}
