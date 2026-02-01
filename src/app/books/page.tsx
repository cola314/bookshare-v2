"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBookStore } from "@/store/useBookStore";
import { getBooks, getBooksByUser } from "@/lib/api";

function BooksContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { books, totalPages, isLoading, error, setPagination, setLoading, setError } = useBookStore();
  const [currentPage, setCurrentPage] = useState(0);

  const fetchBooks = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = userId
        ? await getBooksByUser(Number(userId), page)
        : await getBooks(page);
      setPagination(response);
      setCurrentPage(page);
    } catch (err) {
      console.error("책 목록 로딩 실패:", err);
      setError("책 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(0);
  }, [userId]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      fetchBooks(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalPagesNum = totalPages;
  const pageNumber = currentPage + 1;

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">{userId ? "내 서재" : "책 목록"}</h1>

        {error && (
          <div className="notification is-danger">{error}</div>
        )}

        {isLoading && <p>로딩 중...</p>}

        {!isLoading && (
          <div>
            {books.map((book) => (
              <div key={book.id} className="box">
                <div className="columns">
                  <div className="column is-narrow">
                    {book.cover ? (
                      <img src={book.cover} alt="cover" style={{ width: "100px", height: "150px" }} />
                    ) : (
                      <div style={{ width: "100px", height: "150px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="icon is-large"><i className="fas fa-book fa-2x"></i></span>
                      </div>
                    )}
                  </div>
                  <div className="column">
                    <div className="content">
                      <p className="subtitle"><strong>{book.title}</strong></p>
                      {book.link && (
                        <div className="mb-2">
                          <a className="break-word" href={book.link} target="_blank" rel="noopener noreferrer">{book.link}</a>
                        </div>
                      )}
                      <div className="is-flex is-align-items-center mb-3">
                        <span>작성자: </span>
                        <span className="ml-1">{book.uploadedBy?.username}</span>
                      </div>
                      {book.comment && <pre>{book.comment}</pre>}
                      <p>{new Date(book.uploadDate).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                      <Link className="is-underlined" href={`/books/${book.id}`}>
                        상세보기 댓글({book.commentCount}) 좋아요({book.likeCount})
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {books.length === 0 && !error && (
              <p>등록된 책이 없습니다.</p>
            )}

            {totalPagesNum > 1 && (
              <div className="pagination columns">
                <span className="step-links column is-centered">
                  {currentPage > 0 && (
                    <>
                      <a onClick={() => handlePageChange(0)} style={{ cursor: "pointer" }}>&laquo; first</a>{" "}
                      <a onClick={() => handlePageChange(currentPage - 1)} style={{ cursor: "pointer" }}>previous</a>{" "}
                    </>
                  )}
                  <span className="current">
                    Page {pageNumber} of {totalPagesNum}.
                  </span>
                  {currentPage < totalPagesNum - 1 && (
                    <>
                      {" "}<a onClick={() => handlePageChange(currentPage + 1)} style={{ cursor: "pointer" }}>next</a>{" "}
                      <a onClick={() => handlePageChange(totalPagesNum - 1)} style={{ cursor: "pointer" }}>last &raquo;</a>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container"><p>로딩 중...</p></div></div>}>
      <BooksContent />
    </Suspense>
  );
}
