package com.bookshare.infra.crawler

import com.bookshare.common.exception.BusinessException
import com.bookshare.common.exception.ErrorCode
import com.bookshare.domain.error.ErrorUrl
import com.bookshare.domain.error.ErrorUrlRepository
import com.bookshare.domain.user.User
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class BookCrawler(
    private val errorUrlRepository: ErrorUrlRepository
) {

    private val log = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        private const val TIMEOUT_MS = 10000
        private val ALADIN_URL_PATTERN = Regex("""^https?://(www\.)?aladin\.co\.kr/.*""")
    }

    /**
     * URL 유효성 검증 (알라딘 도메인만 허용)
     */
    fun validateAladinUrl(url: String): Boolean {
        return ALADIN_URL_PATTERN.matches(url)
    }

    /**
     * 알라딘 URL에서 책 정보를 크롤링합니다.
     */
    fun crawlBookInfo(url: String, user: User): AladinBookInfo {
        if (!validateAladinUrl(url)) {
            throw BusinessException(ErrorCode.INVALID_ALADIN_URL)
        }

        try {
            val document = fetchDocument(url)
            return parseAladinPage(document, url)
        } catch (e: BusinessException) {
            throw e
        } catch (e: Exception) {
            log.error("Failed to crawl book info from: $url", e)
            saveErrorUrl(url, user)
            throw BusinessException(ErrorCode.CRAWLING_FAILED, "책 정보 크롤링 실패: ${e.message}")
        }
    }

    /**
     * URL에서 HTML 문서를 가져옵니다.
     */
    private fun fetchDocument(url: String): Document {
        return Jsoup.connect(url)
            .userAgent(USER_AGENT)
            .timeout(TIMEOUT_MS)
            .followRedirects(true)
            .get()
    }

    /**
     * 알라딘 페이지에서 책 정보를 파싱합니다.
     */
    private fun parseAladinPage(document: Document, url: String): AladinBookInfo {
        // 제목 추출 - 여러 선택자 시도
        val title = extractTitle(document)
            ?: throw BusinessException(ErrorCode.CRAWLING_FAILED, "책 제목을 찾을 수 없습니다.")

        // 메타 정보 추출 (저자/출판사)
        val meta = extractMeta(document)

        // 커버 이미지 URL 추출
        val coverUrl = extractCoverImage(document)

        return AladinBookInfo(
            title = title.trim(),
            meta = meta.trim(),
            coverUrl = coverUrl,
            link = url
        )
    }

    /**
     * 제목 추출
     */
    private fun extractTitle(document: Document): String? {
        // 알라딘 상품 페이지 제목 선택자들
        val selectors = listOf(
            "meta[property=og:title]",
            ".Ere_bo_title",
            "#Ere_prod_all498_2 .bo3",
            "h1.p_tit"
        )

        for (selector in selectors) {
            val element = document.selectFirst(selector)
            if (element != null) {
                val text = when {
                    selector.startsWith("meta") -> element.attr("content")
                    else -> element.text()
                }
                if (text.isNotBlank()) {
                    // " - 알라딘" 등의 suffix 제거
                    return text.replace(Regex("\\s*[-|]\\s*알라딘.*$"), "").trim()
                }
            }
        }
        return null
    }

    /**
     * 메타 정보 추출 (저자/출판사)
     */
    private fun extractMeta(document: Document): String {
        // og:description에서 저자/출판사 정보 추출 시도
        val ogDesc = document.selectFirst("meta[property=og:description]")?.attr("content")
        if (!ogDesc.isNullOrBlank()) {
            // 보통 "저자명 저, 출판사, 년도" 형태
            val parts = ogDesc.split(",").take(2)
            if (parts.isNotEmpty()) {
                return parts.joinToString(", ").trim()
            }
        }

        // 상품 상세 페이지에서 저자/출판사 정보 추출
        val authorSelectors = listOf(
            ".Ere_sub2_title a",
            ".author a",
            "#Ere_prod_allinfo_1 li:contains(저자)"
        )

        val authorParts = mutableListOf<String>()
        for (selector in authorSelectors) {
            val elements = document.select(selector)
            if (elements.isNotEmpty()) {
                authorParts.addAll(elements.map { it.text().trim() }.filter { it.isNotBlank() })
                break
            }
        }

        return if (authorParts.isNotEmpty()) {
            authorParts.joinToString(", ")
        } else {
            "정보 없음"
        }
    }

    /**
     * 커버 이미지 URL 추출
     */
    private fun extractCoverImage(document: Document): String? {
        // og:image 먼저 시도
        val ogImage = document.selectFirst("meta[property=og:image]")?.attr("content")
        if (!ogImage.isNullOrBlank()) {
            return normalizeImageUrl(ogImage)
        }

        // 상품 이미지 선택자들
        val imageSelectors = listOf(
            "#CoverMainImage",
            ".cover img",
            "#mainCoverImage",
            ".Ere_prod_gal498_1 img"
        )

        for (selector in imageSelectors) {
            val img = document.selectFirst(selector)
            if (img != null) {
                val src = img.attr("src").ifBlank { img.attr("data-src") }
                if (src.isNotBlank()) {
                    return normalizeImageUrl(src)
                }
            }
        }
        return null
    }

    /**
     * 이미지 URL 정규화
     */
    private fun normalizeImageUrl(url: String): String {
        return when {
            url.startsWith("//") -> "https:$url"
            url.startsWith("/") -> "https://www.aladin.co.kr$url"
            else -> url
        }
    }

    /**
     * 에러 URL 저장
     */
    private fun saveErrorUrl(url: String, user: User) {
        try {
            errorUrlRepository.save(ErrorUrl(url = url, uploadedBy = user))
        } catch (e: Exception) {
            log.error("Failed to save error URL: $url", e)
        }
    }
}

data class AladinBookInfo(
    val title: String,
    val meta: String,
    val coverUrl: String?,
    val link: String
)
