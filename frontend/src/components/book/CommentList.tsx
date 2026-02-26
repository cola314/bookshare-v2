"use client";

import { useState } from "react";
import type { Comment } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookStore } from "@/store/useBookStore";
import { deleteComment } from "@/lib/api";

interface CommentListProps {
  comments: Comment[];
}

const getAuthor = (comment: any) => comment.createdBy || comment.author || null;

export function CommentList({ comments }: CommentListProps) {
  const { user } = useAuthStore();
  const { removeComment } = useBookStore();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (commentId: number) => {
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      removeComment(commentId);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${d} ${h}:${min}`;
  };

  if (comments.length === 0) {
    return <p>아직 댓글이 없습니다.</p>;
  }

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id} className="box">
          <div className="is-flex is-align-items-center mb-3">
            <span>작성자: </span>
            <span className="ml-1">
              {getAuthor(comment)?.nickname || getAuthor(comment)?.username || getAuthor(comment)?.name || "알 수 없음"}
            </span>
          </div>
          <pre>{comment.content}</pre>
          <div className="mt-2">
            <p>{formatDate(comment.createdAt)}</p>
          </div>
          {user && String(user.id) === String(getAuthor(comment)?.id) && (
            <button
              className="button is-danger is-small mt-2"
              onClick={() => handleDelete(comment.id)}
              disabled={deletingId === comment.id}
            >
              삭제
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
