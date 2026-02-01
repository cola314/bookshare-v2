"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getInquiries, confirmInquiry } from "@/lib/api";
import type { Inquiry } from "@/types";

export default function AdminInquiriesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    // 하이드레이션 완료 후 권한 체크
    if (isHydrated) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        router.push("/login?error=Unauthorized");
        return;
      }
      fetchInquiries();
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await getInquiries();
      setInquiries(response);
      setError(null);
    } catch (err) {
      console.error("문의 목록 로드 실패:", err);
      setError("문의 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    if (processingId) return;

    try {
      setProcessingId(id);
      await confirmInquiry(id);
      // 목록 새로고침
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, confirmed: true } : inquiry
        )
      );
    } catch (err) {
      console.error("문의 처리 실패:", err);
      alert("문의 처리에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 하이드레이션 대기 중
  if (!isHydrated) {
    return (
      <section className="section">
        <div className="container">
          <p>로딩 중...</p>
        </div>
      </section>
    );
  }

  // 권한 없음
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null; // 리다이렉트 중
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>로딩 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="title">
            <Link href="/admin">← 대시보드로 돌아가기</Link>
          </h1>
          <div className="notification is-danger">{error}</div>
        </div>
      </section>
    );
  }

  // 미처리/처리완료 분리
  const pendingInquiries = inquiries.filter((i) => !i.confirmed);
  const confirmedInquiries = inquiries.filter((i) => i.confirmed);

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">
          <Link href="/admin">← 대시보드로 돌아가기</Link>
        </h1>
        <h2 className="subtitle">문의 관리</h2>

        {/* 통계 요약 */}
        <div className="columns">
          <div className="column">
            <div className="box">
              <p>미처리 문의</p>
              <p className="title">{pendingInquiries.length}건</p>
            </div>
          </div>
          <div className="column">
            <div className="box">
              <p>처리완료 문의</p>
              <p className="title">{confirmedInquiries.length}건</p>
            </div>
          </div>
        </div>

        {/* 문의 목록 */}
        {inquiries.length === 0 ? (
          <div className="box">
            <p>등록된 문의가 없습니다.</p>
          </div>
        ) : (
          <table className="table is-fullwidth is-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>연락처</th>
                <th>문의 내용</th>
                <th>상태</th>
                <th>등록일</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>{inquiry.id}</td>
                  <td>{inquiry.contact}</td>
                  <td>{inquiry.content}</td>
                  <td>
                    {inquiry.confirmed ? (
                      <span className="tag is-success">처리완료</span>
                    ) : (
                      <span className="tag is-warning">대기중</span>
                    )}
                  </td>
                  <td>{formatDate(inquiry.createdAt)}</td>
                  <td>
                    {!inquiry.confirmed && (
                      <button
                        onClick={() => handleConfirm(inquiry.id)}
                        disabled={processingId === inquiry.id}
                        className={`button is-primary is-small ${
                          processingId === inquiry.id ? "is-loading" : ""
                        }`}
                      >
                        {processingId === inquiry.id ? "처리중..." : "처리완료"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
