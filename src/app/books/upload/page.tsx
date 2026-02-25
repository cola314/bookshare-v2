"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { createBook, searchAladinBooks } from "@/lib/api";
import type { AladinSearchBook, PageResponse } from "@/types";

export default function BookUploadPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  const [keyword, setKeyword] = useState("");
  const [searchPage, setSearchPage] = useState(0);
  const [searchResult, setSearchResult] = useState<PageResponse<AladinSearchBook> | null>(null);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [link, setLink] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?redirect=/books/upload");
    }
  }, [isAuthenticated, isHydrated, router]);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      const message = (err.response?.data as { message?: string } | undefined)?.message;
      if (message) return message;
    }
    return fallback;
  };

  const handleSearch = async (page: number = 0) => {
    const query = keyword.trim();
    if (!query) {
      setError("검색어를 입력해주세요.");
      return;
    }

    setIsSearching(true);
    setError(null);

    if (page === 0) {
      setSearchResult(null);
    }

    try {
      const result = await searchAladinBooks(query, page, 10);
      setSearchResult(result);
      setSearchPage(page);
      setSearchedKeyword(query);
    } catch (err) {
      console.error("알라딘 검색 실패:", err);
      setError(getErrorMessage(err, "검색에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFromResult = async (selectedLink: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const book = await createBook(selectedLink, comment.trim());
      router.push(`/books/${book.id}`);
    } catch (err) {
      console.error("책 등록 실패:", err);
      setError(getErrorMessage(err, "책 등록에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedLink = link.trim();
    if (!trimmedLink) {
      setError("알라딘 URL을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const book = await createBook(trimmedLink, comment.trim());
      router.push(`/books/${book.id}`);
    } catch (err) {
      console.error("책 등록 실패:", err);
      setError(getErrorMessage(err, "책 등록에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="section">
        <div className="container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const totalPages = searchResult?.totalPages ?? 0;
  const currentPage = searchResult?.page ?? searchResult?.number ?? searchPage;

  return (
    <div className="section">
      <div className="container">
        <div className="mb-2">
          <h1 className="title">업로드</h1>
        </div>

        <div className="mb-2">
          <h2 className="subtitle">
            아래 예시처럼 <span className="has-text-danger">알라딘</span>에서 책을 검색하여 링크를 넣어야 합니다
          </h2>
        </div>

        <strong>https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=315599742</strong>
        <br />
        <strong>https://www.aladin.co.kr/m/mproduct.aspx?itemid=315599742</strong>
        <br />
        <strong>http://aladin.kr/p/yfZPx</strong>
        <div>
          <a
            className="is-underlined"
            href="https://www.aladin.co.kr/home/welcome.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            검색하러 가기
          </a>
        </div>

        {error && <div className="notification is-danger mt-3">{error}</div>}

        <div className="box mt-4">
          <h3 className="title is-5 mb-3">책 검색</h3>
          <div className="field has-addons">
            <div className="control is-expanded">
              <input
                className="input"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="책 제목, 저자 등으로 검색"
                disabled={isSearching || isSubmitting}
              />
            </div>
            <div className="control">
              <button
                className={`button is-link ${isSearching ? "is-loading" : ""}`}
                onClick={() => handleSearch(0)}
                disabled={isSearching || isSubmitting || !keyword.trim()}
                type="button"
              >
                검색
              </button>
            </div>
          </div>

          <div className="field mt-4">
            <label className="label">코멘트</label>
            <div className="control">
              <textarea
                className="textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="이 책에 대한 소개를 작성해주세요..."
                rows={5}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {searchResult && (
            <>
              <div className="mt-4 mb-3">
                <strong>
                  &quot;{searchedKeyword}&quot; 검색 결과 ({searchResult.totalElements}건)
                </strong>
              </div>

              {searchResult.content.length === 0 ? (
                <p>검색 결과가 없습니다.</p>
              ) : (
                <div>
                  {searchResult.content.map((item, index) => (
                    <div className="box" key={`${item.link}-${index}`}>
                      <div className="columns is-vcentered">
                        <div className="column is-narrow">
                          {item.cover ? (
                            <img src={item.cover} alt={item.title} style={{ width: "80px", height: "120px", objectFit: "cover" }} />
                          ) : (
                            <div
                              style={{
                                width: "80px",
                                height: "120px",
                                background: "#eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span className="icon is-large">
                                <i className="fas fa-book fa-2x"></i>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="column">
                          <p className="mb-1">
                            <strong>{item.title}</strong>
                          </p>
                          {item.meta && <p className="is-size-7 mb-2">{item.meta}</p>}
                          <a
                            className="is-underlined is-size-7"
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            알라딘 링크 보기
                          </a>
                        </div>

                        <div className="column is-narrow">
                          <button
                            className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
                            type="button"
                            onClick={() => handleAddFromResult(item.link)}
                            disabled={isSubmitting || isSearching}
                          >
                            추가
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination columns">
                  <span className="step-links column is-centered">
                    {currentPage > 0 && (
                      <>
                        <a onClick={() => handleSearch(0)} style={{ cursor: "pointer" }}>
                          &laquo; first
                        </a>{" "}
                        <a onClick={() => handleSearch(currentPage - 1)} style={{ cursor: "pointer" }}>
                          previous
                        </a>{" "}
                      </>
                    )}
                    <span className="current">
                      Page {currentPage + 1} of {totalPages}.
                    </span>
                    {currentPage < totalPages - 1 && (
                      <>
                        {" "}
                        <a onClick={() => handleSearch(currentPage + 1)} style={{ cursor: "pointer" }}>
                          next
                        </a>{" "}
                        <a onClick={() => handleSearch(totalPages - 1)} style={{ cursor: "pointer" }}>
                          last &raquo;
                        </a>
                      </>
                    )}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <details className="mt-4">
          <summary className="has-text-weight-semibold">고급 옵션 (URL 직접 입력)</summary>
          <form onSubmit={handleDirectSubmit} className="mt-3">
            <div className="field">
              <label className="label">알라딘 URL</label>
              <div className="control">
                <input
                  className="input"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=..."
                  disabled={isSubmitting || isSearching}
                />
              </div>
            </div>
            <button className={`button is-primary mt-2 ${isSubmitting ? "is-loading" : ""}`} type="submit" disabled={isSubmitting || isSearching}>
              URL로 추가
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
