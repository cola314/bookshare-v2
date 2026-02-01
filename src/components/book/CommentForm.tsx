"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookStore } from "@/store/useBookStore";
import { createComment } from "@/lib/api";

interface CommentFormProps {
  bookId: number;
}

export function CommentForm({ bookId }: CommentFormProps) {
  const { isAuthenticated } = useAuthStore();
  const { addComment } = useBookStore();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment = await createComment(bookId, content.trim());
      addComment(newComment);
      setContent("");
    } catch (err) {
      console.error("댓글 작성 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <p>댓글을 작성하려면 <a href="/login">로그인</a>이 필요합니다.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <div className="control">
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <button className="button is-primary mt-2" type="submit" disabled={isSubmitting || !content.trim()}>
        추가
      </button>
    </form>
  );
}
