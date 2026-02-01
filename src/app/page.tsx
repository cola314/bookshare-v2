"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getHomeStats, getRecentNotices } from "@/lib/api";
import type { Notice } from "@/types";

export default function Home() {
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [statsResponse, noticesResponse] = await Promise.all([
        getHomeStats().catch(() => ({ totalBooks: 0 })),
        getRecentNotices().catch(() => []),
      ]);
      setTotalBooks(statsResponse.totalBooks);
      setRecentNotices(noticesResponse);
    } catch (err) {
      console.error("홈 데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">책 리뷰 공유 사이트</h1>
        {!loading && (
          <h2 className="title is-5">{totalBooks}개의 책이 등록되었어요</h2>
        )}
        <Link className="button is-info mb-6" href="/books">책 보러 가기</Link>

        <p className="title is-4">최신 공지사항</p>
        <div className="mb-4">
          <Link className="subtitle has-text-link" href="/notice">전체 공지사항 보러 가기</Link>
        </div>
        <div>
          {loading ? (
            <p>로딩 중...</p>
          ) : recentNotices.length > 0 ? (
            recentNotices.map((notice) => (
              <div key={notice.id} className="box content">
                <h3>{notice.topFixed ? `(중요) ${notice.title}` : notice.title}</h3>
                {notice.content && <pre>{notice.content}</pre>}
                <p>{formatDate(notice.createdAt)}</p>
              </div>
            ))
          ) : (
            <p>등록된 공지사항이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
