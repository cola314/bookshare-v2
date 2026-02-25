"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { autocompleteAladinBooks, createBook, searchAladinBooks } from "@/lib/api";
import type { AladinSearchBook, PageResponse } from "@/types";

type UploadStep = "search" | "comment";
type SelectedBook = Pick<AladinSearchBook, "title" | "meta" | "cover" | "link">;

export default function BookUploadPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  const [step, setStep] = useState<UploadStep>("search");
  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(null);

  const [keyword, setKeyword] = useState("");
  const [searchPage, setSearchPage] = useState(0);
  const [searchResult, setSearchResult] = useState<PageResponse<AladinSearchBook> | null>(null);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [suggestions, setSuggestions] = useState<AladinSearchBook[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [link, setLink] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?redirect=/books/upload");
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (step !== "search") {
      return;
    }

    const query = keyword.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const result = await autocompleteAladinBooks(query, 5);
        if (!cancelled) {
          setSuggestions(result);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSuggesting(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [keyword, step]);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      const message = (err.response?.data as { message?: string } | undefined)?.message;
      if (message) return message;
    }
    return fallback;
  };

  const handleSearch = async (page: number = 0, queryOverride?: string) => {
    const query = (queryOverride ?? keyword).trim();
    if (!query) {
      setError("검색어를 입력해주세요.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setShowSuggestions(false);

    if (queryOverride) {
      setKeyword(queryOverride);
    }

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

  const handleSelectSuggestion = (item: AladinSearchBook) => {
    setKeyword(item.title);
    void handleSearch(0, item.title);
  };

  const handleChooseBook = (book: AladinSearchBook) => {
    setSelectedBook(book);
    setStep("comment");
    setError(null);
  };

  const handleBackToSearch = () => {
    setStep("search");
    setError(null);
  };

  const handleSubmitSelected = async () => {
    if (!selectedBook) {
      setError("선택된 책이 없습니다. 다시 선택해주세요.");
      setStep("search");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const book = await createBook(selectedBook.link, comment.trim());
      router.push(`/books/${book.id}`);
    } catch (err) {
      console.error("책 등록 실패:", err);
      setError(getErrorMessage(err, "책 등록에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectSelect = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedLink = link.trim();
    if (!trimmedLink) {
      setError("알라딘 URL을 입력해주세요.");
      return;
    }

    setSelectedBook({
      title: "직접 입력한 알라딘 링크",
      meta: trimmedLink,
      link: trimmedLink,
      cover: "",
    });
    setStep("comment");
    setError(null);
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
        <div className="mb-3">
          <h1 className="title">업로드</h1>
          <h2 className="subtitle">{step === "search" ? "1단계: 책 검색 및 선택" : "2단계: 코멘트 작성 및 등록"}</h2>
        </div>

        {error && <div className="notification is-danger mb-4">{error}</div>}

        {step === "search" && (
          <div className="box">
            <h3 className="title is-5 mb-3">책 검색</h3>

            <div className="field has-addons">
              <div className="control is-expanded" style={{ position: "relative" }}>
                <input
                  className="input"
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    window.setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSearch(0);
                    }
                  }}
                  placeholder="책 제목, 저자 등으로 검색"
                  disabled={isSearching || isSubmitting}
                />

                {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
                  <div
                    className="box"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: "calc(100% + 4px)",
                      zIndex: 20,
                      maxHeight: "280px",
                      overflowY: "auto",
                      margin: 0,
                    }}
                  >
                    {isSuggesting && suggestions.length === 0 && <p className="is-size-7 has-text-grey">추천어 불러오는 중...</p>}

                    {suggestions.map((item, index) => (
                      <button
                        key={`${item.link}-${index}`}
                        type="button"
                        className="button is-white is-fullwidth is-justify-content-flex-start"
                        style={{ justifyContent: "flex-start", height: "auto", padding: "0.5rem" }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <span className="has-text-left" style={{ whiteSpace: "normal" }}>
                          <strong>{item.title}</strong>
                          {item.meta && <span className="is-size-7 has-text-grey"> · {item.meta}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
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
                            <a className="is-underlined is-size-7" href={item.link} target="_blank" rel="noopener noreferrer">
                              알라딘 링크 보기
                            </a>
                          </div>

                          <div className="column is-narrow">
                            <button
                              className="button is-primary"
                              type="button"
                              onClick={() => handleChooseBook(item)}
                              disabled={isSubmitting || isSearching}
                            >
                              선택
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

            <details className="mt-4">
              <summary className="has-text-weight-semibold">고급 옵션 (URL 직접 입력)</summary>
              <form onSubmit={handleDirectSelect} className="mt-3">
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
                <button className="button is-primary mt-2" type="submit" disabled={isSubmitting || isSearching || !link.trim()}>
                  URL 선택 후 다음 단계
                </button>
              </form>
            </details>
          </div>
        )}

        {step === "comment" && selectedBook && (
          <div className="box">
            <h3 className="title is-5 mb-3">선택한 책 확인</h3>
            <div className="columns is-vcentered">
              <div className="column is-narrow">
                {selectedBook.cover ? (
                  <img src={selectedBook.cover} alt={selectedBook.title} style={{ width: "80px", height: "120px", objectFit: "cover" }} />
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
                  <strong>{selectedBook.title}</strong>
                </p>
                {selectedBook.meta && <p className="is-size-7 mb-2">{selectedBook.meta}</p>}
                <a className="is-underlined is-size-7" href={selectedBook.link} target="_blank" rel="noopener noreferrer">
                  알라딘 링크 보기
                </a>
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

            <div className="buttons mt-4">
              <button className="button" type="button" onClick={handleBackToSearch} disabled={isSubmitting}>
                뒤로
              </button>
              <button
                className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}
                type="button"
                onClick={handleSubmitSelected}
                disabled={isSubmitting}
              >
                등록
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
