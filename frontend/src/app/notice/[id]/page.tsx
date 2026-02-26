"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getNotice } from "@/lib/api";
import type { Notice } from "@/types";

export default function NoticeDetailPage() {
  const params = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const response = await getNotice(Number(params.id));
        setNotice(response);
      } catch (err) {
        console.error("공지사항 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchNotice();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${d} ${h}:${min}`;
  };

  if (loading) return <div className="section"><div className="container"><p>로딩 중...</p></div></div>;
  if (!notice) return <div className="section"><div className="container"><p>공지사항을 찾을 수 없습니다.</p></div></div>;

  return (
    <div className="section">
      <div className="container">
        <p className="title">{notice.topFixed ? `(중요) ${notice.title}` : notice.title}</p>
        <div className="box content">
          {notice.content && <pre>{notice.content}</pre>}
          <p>{formatDate(notice.createdAt)}</p>
        </div>
        <Link href="/notice" className="is-underlined">공지사항 목록으로</Link>
      </div>
    </div>
  );
}
