package com.bookshare.infra.aladin

import com.bookshare.api.dto.AladinSearchBookResponse
import com.bookshare.common.exception.BusinessException
import com.bookshare.common.exception.ErrorCode
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.jsoup.Connection
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Component

@Component
class AladinSearchClient {

    companion object {
        private const val ALADIN_BASE_URL = "https://www.aladin.co.kr"
        private const val ALADIN_SEARCH_URL = "$ALADIN_BASE_URL/search/wsearchresult.aspx"
        private const val ALADIN_AUTOCOMPLETE_URL = "$ALADIN_BASE_URL/search/v2/search-items.ashx"
        private const val USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        private const val TIMEOUT_MS = 10000
        private const val MIN_AUTOCOMPLETE_SIZE = 1
        private const val MAX_AUTOCOMPLETE_SIZE = 20
        private val TITLE_HIGHLIGHT_TAG_REGEX = Regex("</?em>", RegexOption.IGNORE_CASE)
    }

    private val objectMapper = jacksonObjectMapper()

    fun searchBooks(query: String, pageable: Pageable): Page<AladinSearchBookResponse> {
        return try {
            val document = Jsoup.connect(ALADIN_SEARCH_URL)
                .userAgent(USER_AGENT)
                .timeout(TIMEOUT_MS)
                .followRedirects(true)
                .data("SearchTarget", "Book")
                .data("SearchWord", query)
                .data("SortOrder", "11")
                .data("ViewRowsCount", pageable.pageSize.toString())
                .data("page", (pageable.pageNumber + 1).toString())
                .get()

            val content = parseBooks(document)
            val totalElements = parseTotalBookCount(document) ?: content.size.toLong()

            PageImpl(content, pageable, totalElements)
        } catch (e: BusinessException) {
            throw e
        } catch (e: Exception) {
            throw BusinessException(
                ErrorCode.ALADIN_SEARCH_FAILED,
                e.message ?: ErrorCode.ALADIN_SEARCH_FAILED.message
            )
        }
    }

    fun autocompleteBooks(query: String, size: Int): List<AladinSearchBookResponse> {
        val normalizedSize = size.coerceIn(MIN_AUTOCOMPLETE_SIZE, MAX_AUTOCOMPLETE_SIZE)

        return try {
            val responseBody = Jsoup.connect(ALADIN_AUTOCOMPLETE_URL)
                .userAgent(USER_AGENT)
                .timeout(TIMEOUT_MS)
                .ignoreContentType(true)
                .method(Connection.Method.POST)
                .data("q", query)
                .data("t", "Book")
                .data("mode", "0")
                .execute()
                .body()

            parseAutocompleteResponse(responseBody, normalizedSize)
        } catch (e: BusinessException) {
            throw e
        } catch (e: Exception) {
            throw BusinessException(
                ErrorCode.ALADIN_SEARCH_FAILED,
                e.message ?: ErrorCode.ALADIN_SEARCH_FAILED.message
            )
        }
    }

    private fun parseAutocompleteResponse(responseBody: String, size: Int): List<AladinSearchBookResponse> {
        val root = objectMapper.readTree(responseBody)
        validateAutocompleteResult(root)

        val listNode = root.path("List")
        if (!listNode.isArray) return emptyList()

        return listNode
            .asSequence()
            .mapNotNull { node -> mapAutocompleteItem(node) }
            .take(size)
            .toList()
    }

    private fun validateAutocompleteResult(root: JsonNode) {
        val resultCode = root.path("ResultCode").asInt(-1)
        if (resultCode != 1) {
            throw BusinessException(
                ErrorCode.ALADIN_SEARCH_FAILED,
                "알라딘 자동완성 조회 실패 (ResultCode=$resultCode)"
            )
        }
    }

    private fun mapAutocompleteItem(node: JsonNode): AladinSearchBookResponse? {
        val itemId = node.path("ItemId").asLong(0L)
        if (itemId <= 0L) return null

        val rawTitle = node.path("Title").asText("")
        val title = sanitizeAutocompleteTitle(rawTitle)
        if (title.isBlank()) return null

        return AladinSearchBookResponse(
            title = title,
            meta = "",
            cover = null,
            link = "$ALADIN_BASE_URL/shop/wproduct.aspx?ItemId=$itemId",
            isbn13 = ""
        )
    }

    private fun sanitizeAutocompleteTitle(rawTitle: String): String {
        return TITLE_HIGHLIGHT_TAG_REGEX
            .replace(rawTitle, "")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    private fun parseBooks(document: Document): List<AladinSearchBookResponse> {
        val containers = document.select("div.ss_book_box").ifEmpty {
            document.select("div.ss_book_list")
        }

        val seenLinks = linkedSetOf<String>()
        val books = mutableListOf<AladinSearchBookResponse>()

        for (container in containers) {
            val titleAnchor = container.selectFirst("a.bo3") ?: continue
            val title = titleAnchor.text().trim()
            if (title.isBlank()) continue

            val link = normalizeAladinUrl(titleAnchor.attr("href"))
            if (link.isBlank() || !seenLinks.add(link)) continue

            val cover = extractCover(container)
            val meta = extractMeta(container, title).ifBlank { "정보 없음" }

            books += AladinSearchBookResponse(
                title = title,
                meta = meta,
                cover = cover,
                link = link,
                isbn13 = ""
            )
        }

        return books
    }

    private fun extractCover(container: Element): String? {
        val imageCandidates = listOf(
            "div.cover_area img.front_cover",
            "div.cover_area img",
            "img.front_cover",
            "a img.front_cover",
            "a img",
            "img"
        )

        for (selector in imageCandidates) {
            val image = container.selectFirst(selector) ?: continue
            val src = image.attr("data-src").ifBlank { image.attr("src") }
            if (src.isNotBlank()) {
                return normalizeImageUrl(src)
            }
        }

        return null
    }

    private fun extractMeta(container: Element, title: String): String {
        val titleAnchor = container.selectFirst("a.bo3")
        var sibling = titleAnchor?.parent()

        repeat(5) {
            sibling = sibling?.nextElementSibling()
            val text = sibling?.text()?.trim().orEmpty()
            if (text.isNotBlank() && text != title) {
                return text.replace(Regex("\\s+"), " ")
            }
        }

        val lineCandidates = container.select("li, p, div, span")
            .map { it.text().trim() }
            .filter { it.isNotBlank() && it != title }

        return lineCandidates.firstOrNull()?.replace(Regex("\\s+"), " ") ?: "정보 없음"
    }

    private fun parseTotalBookCount(document: Document): Long? {
        val targetLabels = document.select("a[href*=SearchTarget=Book], a[href*=searchTarget=Book]")
            .map { it.text() }

        for (label in targetLabels) {
            extractCount(label)?.let { return it }
        }

        val fallbackTexts = listOf(
            document.selectFirst(".ss_tit")?.text(),
            document.selectFirst(".navi_search")?.text(),
            document.selectFirst(".search_result")?.text()
        )

        for (text in fallbackTexts) {
            extractCount(text).let { count ->
                if (count != null) return count
            }
        }

        return null
    }

    private fun extractCount(text: String?): Long? {
        if (text.isNullOrBlank()) return null
        val match = Regex("([0-9][0-9,]*)").find(text) ?: return null
        return match.groupValues[1].replace(",", "").toLongOrNull()
    }

    private fun normalizeAladinUrl(url: String): String {
        if (url.isBlank()) return ""

        return when {
            url.startsWith("https://") -> url
            url.startsWith("http://") -> "https://${url.removePrefix("http://")}"
            url.startsWith("//") -> "https:$url"
            url.startsWith("/") -> "$ALADIN_BASE_URL$url"
            else -> "$ALADIN_BASE_URL/${url.removePrefix("/")}"
        }
    }

    private fun normalizeImageUrl(url: String): String {
        val normalized = when {
            url.startsWith("https://") -> url
            url.startsWith("http://") -> "https://${url.removePrefix("http://")}"
            url.startsWith("//") -> "https:$url"
            url.startsWith("/") -> "$ALADIN_BASE_URL$url"
            else -> url
        }

        return normalized
            .replace("/cover150/", "/cover200/")
            .replace("_cover150", "_cover200")
            .replace("cover/150/", "cover/200/")
    }
}
