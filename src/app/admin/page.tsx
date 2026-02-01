"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getDashboard } from "@/lib/api";
import type { Dashboard } from "@/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      fetchDashboard();
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      setDashboard(response);
    } catch (err) {
      console.error("대시보드 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading) return <div className="section"><div className="container"><p>로딩 중...</p></div></div>;

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">관리</h1>
        <div className="columns">
          <div className="column is-3">
            <div className="box">
              <div className="subtitle is-size-4">문의</div>
              <p>처리 완료: {dashboard?.confirmedInquiries ?? 0}건</p>
              <p>처리 중: {dashboard?.pendingInquiries ?? 0}건</p>
              <Link className="is-size-5" href="/admin/inquiries">문의 관리</Link>
            </div>
          </div>
          <div className="column is-3">
            <div className="box">
              <div className="subtitle is-size-4">빠른 메뉴</div>
              <div className="menu">
                <p className="menu-label is-size-6">관리자 페이지</p>
                <ul className="menu-list">
                  <li><Link className="is-size-5" href="/admin/inquiries">문의 관리</Link></li>
                  <li><Link className="is-size-5" href="/books">책 목록</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
