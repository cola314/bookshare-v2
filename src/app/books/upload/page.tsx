"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createBook } from "@/lib/api";

export default function BookUploadPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [link, setLink] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?redirect=/books/upload");
    }
  }, [isAuthenticated, isHydrated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) { setError("알라딘 URL을 입력해주세요."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const book = await createBook(link.trim(), comment.trim());
      router.push(`/books/${book.id}`);
    } catch (err) {
      console.error("책 등록 실패:", err);
      setError("책 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || !isAuthenticated) return <div className="section"><div className="container"><p>로딩 중...</p></div></div>;

  return (
    <div className="section">
      <div className="container">
        <div className="mb-2">
          <h1 className="title">업로드</h1>
        </div>
        <div className="mb-2">
          <h2 className="subtitle">아래 예시처럼 <span className="has-text-danger">알라딘</span>에서 책을 검색하여 링크를 넣어야 합니다</h2>
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
            <label className="label">알라딘 URL</label>
            <div className="control">
              <input
                className="input"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=..."
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="field">
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
          <button className="button is-primary mt-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "확인"}
          </button>
        </form>
      </div>
    </div>
  );
}
