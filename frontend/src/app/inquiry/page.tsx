"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInquiry } from "@/lib/api";

export default function InquiryPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) { setError("연락처를 입력해주세요."); return; }
    if (!content.trim()) { setError("문의 내용을 입력해주세요."); return; }
    try {
      setLoading(true);
      setError(null);
      await createInquiry(contact.trim(), content.trim());
      router.push("/inquiry/success");
    } catch (err) {
      console.error("문의 등록 실패:", err);
      setError("문의 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">문의</h1>
        <p className="subtitle">버그 및 개선 사항을 보내 주세요</p>

        {error && <div className="notification is-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">연락처</label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="이메일 또는 전화번호"
                disabled={loading}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">내용</label>
            <div className="control">
              <textarea
                className="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="문의 내용을 입력해주세요"
                rows={6}
                style={{ height: "150px" }}
                disabled={loading}
              />
            </div>
          </div>
          <button className="button is-primary mt-2" type="submit" disabled={loading}>
            {loading ? "등록 중..." : "등록"}
          </button>
        </form>
      </div>
    </div>
  );
}
