package com.bookshare.api

import com.bookshare.api.dto.InquiryRequest
import com.bookshare.api.dto.InquiryResponse
import com.bookshare.domain.inquiry.InquiryService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@Tag(name = "Inquiries", description = "Inquiry API")
@RestController
class InquiryController(
    private val inquiryService: InquiryService
) {

    @Operation(summary = "문의 등록", description = "새로운 문의를 등록합니다. (비로그인도 가능)")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "등록 성공")
    )
    @PostMapping("/api/inquiries")
    fun createInquiry(
        @Valid @RequestBody request: InquiryRequest
    ): ResponseEntity<InquiryResponse> {
        val result = inquiryService.createInquiry(request.contact, request.content)
        return ResponseEntity.status(HttpStatus.CREATED).body(InquiryResponse.from(result))
    }

    @Operation(
        summary = "문의 목록 조회",
        description = "전체 문의 목록을 조회합니다. (ADMIN 권한 필요)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "403", description = "권한 없음")
    )
    @GetMapping("/api/admin/inquiries")
    @PreAuthorize("hasRole('ADMIN')")
    fun getInquiries(): ResponseEntity<List<InquiryResponse>> {
        val result = inquiryService.getInquiries()
            .map { InquiryResponse.from(it) }
        return ResponseEntity.ok(result)
    }

    @Operation(
        summary = "문의 처리 완료",
        description = "문의를 처리 완료 상태로 변경합니다. (ADMIN 권한 필요)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "처리 완료 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "403", description = "권한 없음"),
        ApiResponse(responseCode = "404", description = "문의를 찾을 수 없음")
    )
    @PutMapping("/api/admin/inquiries/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    fun confirmInquiry(
        @Parameter(description = "문의 ID") @PathVariable id: Long
    ): ResponseEntity<InquiryResponse> {
        val result = inquiryService.confirmInquiry(id)
        return ResponseEntity.ok(InquiryResponse.from(result))
    }
}
