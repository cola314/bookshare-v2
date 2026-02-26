"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getBook, updateBook } from "@/lib/api";
import type { Book } from "@/types";

export default function BookEditPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(`/login?redirect=/books/${bookId}/edit`);
      return;
    }
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const bookData = await getBook(bookId);
        setBook(bookData);
        setComment(bookData.comment || "");
        if (isHydrated && user && String(user.id) !== String(bookData.uploadedBy?.id)) {
          router.push(`/books/${bookId}`);
        }
      } catch (err) {
        console.error("책 정보 로딩 실패:", err);
        setError("책 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    if (bookId && isHydrated) fetchBook();
  }, [bookId, isHydrated, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) { setError("설명을 입력해주세요."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await updateBook(bookId, comment.trim());
      router.push(`/books/${bookId}`);
    } catch (err) {
      console.error("책 수정 실패:", err);
      setError("책 수정에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || isLoading) return <div className="section"><div className="container"><p>로딩 중...</p></div></div>;
  if (!book) return <div className="section"><div className="container"><p>책을 찾을 수 없습니다.</p></div></div>;

  return (
    <div className="section">
      <div className="container">
        <div className="mb-2">
          <h1 className="title">책 수정</h1>
        </div>
        <div className="mb-2">
          <h2 className="subtitle">아래 예시처럼 알라딘에서 책을 검색하여 링크를 넣어야 합니다</h2>
        </div>
        <strong>https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=315599742</strong>
        <br /><strong>https://www.aladin.co.kr/m/mproduct.aspx?itemid=315599742</strong>
        <br /><strong>http://aladin.kr/p/yfZPx</strong>
        <div>
          <a className="is-underlined" href="https://www.aladin.co.kr/home/welcome.aspx" target="_blank" rel="noopener noreferrer">검색하러 가기</a>
        </div>

        {error && <div className="notification is-danger mt-3">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="field">
            <label className="label">코멘트</label>
            <div className="control">
              <textarea
                className="textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="mt-2">
            <button className="button is-link" type="submit" disabled={isSubmitting}>확인</button>
            <Link className="button is-light ml-2" href={`/books/${bookId}`}>취소</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
