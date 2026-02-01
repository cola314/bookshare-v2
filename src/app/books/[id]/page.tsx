"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBookStore } from "@/store/useBookStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getBook, getComments, toggleLike, deleteBook, createComment, deleteComment } from "@/lib/api";
import type { Comment } from "@/types";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);

  const { currentBook, comments, setCurrentBook, setComments, updateBookLike, addComment, removeComment, setError } = useBookStore();
  const { user, isAuthenticated } = useAuthStore();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      setError(null);
      try {
        const [bookData, commentsData] = await Promise.all([
          getBook(bookId),
          getComments(bookId),
        ]);
        setCurrentBook(bookData);
        setComments(commentsData);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setError("책 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsPageLoading(false);
      }
    };
    if (bookId) fetchData();
    return () => { setCurrentBook(null); setComments([]); };
  }, [bookId]);

  const handleLike = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setIsLiking(true);
    try {
      const result = await toggleLike(bookId);
      const currentLikeCount = currentBook?.likeCount ?? 0;
      const newLikeCount = result.likeCount ?? (result.liked ? currentLikeCount + 1 : Math.max(0, currentLikeCount - 1));
      updateBookLike(bookId, result.liked, newLikeCount);
    } catch (err) {
      console.error("좋아요 실패:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      await deleteBook(bookId);
      router.push("/books");
    } catch (err) {
      console.error("삭제 실패:", err);
      setIsDeleting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await createComment(bookId, commentContent.trim());
      addComment(newComment);
      setCommentContent("");
    } catch (err) {
      console.error("댓글 작성 실패:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId);
      removeComment(commentId);
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const isOwner = user && currentBook && String(user.id) === String(currentBook.uploadedBy?.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${d} ${h}:${min}`;
  };

  if (isPageLoading) return <div className="section"><div className="container"><p>로딩 중...</p></div></div>;
  if (!currentBook) return <div className="section"><div className="container"><p>책을 찾을 수 없습니다.</p><Link href="/books">목록으로</Link></div></div>;

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">상세 페이지</h1>
        <div className="box">
          <div className="columns">
            <div className="column is-narrow">
              {currentBook.cover ? (
                <img src={currentBook.cover} alt="cover" style={{ width: "100px", height: "150px" }} />
              ) : (
                <div style={{ width: "100px", height: "150px", background: "#eee" }}></div>
              )}
            </div>
            <div className="column">
              <div className="content">
                <p className="subtitle"><strong>{currentBook.title}</strong></p>
                {currentBook.link && (
                  <div className="mb-2">
                    <a className="break-word" href={currentBook.link} target="_blank" rel="noopener noreferrer">{currentBook.link}</a>
                  </div>
                )}
                <div className="is-flex is-align-items-center mb-3">
                  <span>작성자: </span>
                  <span className="ml-1">{currentBook.uploadedBy?.username}</span>
                </div>
                {currentBook.comment && <pre>{currentBook.comment}</pre>}
                <p>{formatDate(currentBook.uploadDate)}</p>

                <form style={{ display: "inline" }}>
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={isLiking}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <span className="icon">
                      <i className={`fas fa-heart ${currentBook.isLiked ? "has-text-danger" : ""}`}></i>
                    </span>
                    좋아요({currentBook.likeCount})
                  </button>
                </form>

                {isOwner && (
                  <div className="mt-4">
                    <button className="button is-danger" onClick={handleDelete} disabled={isDeleting}>삭제</button>
                    <Link className="button is-link ml-2" href={`/books/${bookId}/edit`}>수정</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <h2 className="subtitle is-bold">댓글</h2>
        {comments.map((comment) => (
          <div key={comment.id} className="box">
            <div className="is-flex is-align-items-center mb-3">
              <span>작성자: </span>
              <span className="ml-1">
                {comment.createdBy?.username || "알 수 없음"}
              </span>
            </div>
            <pre>{comment.content}</pre>
            <div className="mt-2">
              <p>{formatDate(comment.createdAt)}</p>
            </div>
            {user && String(user.id) === String(comment.createdBy?.id) && (
              <button
                className="button is-danger is-small mt-2"
                onClick={() => handleCommentDelete(comment.id)}
                disabled={deletingCommentId === comment.id}
              >
                삭제
              </button>
            )}
          </div>
        ))}

        {comments.length === 0 && <p>아직 댓글이 없습니다.</p>}

        <h3 className="subtitle is-bold">댓글 추가</h3>
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <div className="field">
              <div className="control">
                <textarea
                  className="textarea"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  rows={3}
                  disabled={isSubmittingComment}
                />
              </div>
            </div>
            <button className="button is-primary mt-2" type="submit" disabled={isSubmittingComment || !commentContent.trim()}>
              추가
            </button>
          </form>
        ) : (
          <p>댓글을 작성하려면 <Link href="/login">로그인</Link>이 필요합니다.</p>
        )}
      </div>
    </div>
  );
}
