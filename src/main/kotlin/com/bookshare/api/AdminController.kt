package com.bookshare.api

import com.bookshare.api.dto.DashboardResponse
import com.bookshare.domain.admin.AdminService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Admin", description = "Admin API")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    private val adminService: AdminService
) {

    @Operation(
        summary = "대시보드 통계 조회",
        description = "총 책 수, 미처리 문의 수, 처리완료 문의 수를 조회합니다. (ADMIN 권한 필요)",
        security = [SecurityRequirement(name = "bearerAuth")]
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "조회 성공"),
        ApiResponse(responseCode = "401", description = "인증 필요"),
        ApiResponse(responseCode = "403", description = "권한 없음")
    )
    @GetMapping("/dashboard")
    fun getDashboard(): ResponseEntity<DashboardResponse> {
        val result = adminService.getDashboard()
        return ResponseEntity.ok(DashboardResponse.from(result))
    }
}
