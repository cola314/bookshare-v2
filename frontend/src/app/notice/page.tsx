"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getNotices } from "@/lib/api";
import type { Notice, PageResponse } from "@/types";

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<Notice> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotices(); }, [currentPage]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await getNotices(currentPage);
      setNotices(response.content);
      setPageInfo(response);
    } catch (err) {
      console.error("공지사항 로드 실패:", err);
    } finally {
      setLoading(false);
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

  const totalPagesNum = pageInfo?.totalPages || 0;
  const pageNumber = currentPage + 1;

  return (
    <div className="section">
      <div className="container">
        <p className="title">공지사항</p>
        {loading ? <p>로딩 중...</p> : (
          <>
            <div className="mb-2">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  style={{ display: "block", marginBottom: "1rem" }}
                >
                  <div className="box content">
                    <h3>{notice.topFixed ? `(중요) ${notice.title}` : notice.title}</h3>
                    {notice.content && <pre>{notice.content}</pre>}
                    <p>{formatDate(notice.createdAt)}</p>
                  </div>
                </Link>
              ))}
              {notices.length === 0 && <p>등록된 공지사항이 없습니다.</p>}
            </div>

            {totalPagesNum > 1 && (
              <div className="pagination columns">
                <span className="step-links column is-centered">
                  {currentPage > 0 && (
                    <>
                      <a onClick={() => setCurrentPage(0)} style={{ cursor: "pointer" }}>&laquo; first</a>{" "}
                      <a onClick={() => setCurrentPage(currentPage - 1)} style={{ cursor: "pointer" }}>previous</a>{" "}
                    </>
                  )}
                  <span className="current">Page {pageNumber} of {totalPagesNum}.</span>
                  {currentPage < totalPagesNum - 1 && (
                    <>
                      {" "}<a onClick={() => setCurrentPage(currentPage + 1)} style={{ cursor: "pointer" }}>next</a>{" "}
                      <a onClick={() => setCurrentPage(totalPagesNum - 1)} style={{ cursor: "pointer" }}>last &raquo;</a>
                    </>
                  )}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
