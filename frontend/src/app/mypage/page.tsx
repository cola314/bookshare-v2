"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?callbackUrl=/mypage");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="section">
        <div className="container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">내 정보</h1>

        <div className="box">
          {user.profileImageUrl && (
            <figure className="image is-96x96 mb-4">
              <img
                src={user.profileImageUrl}
                alt={user.username}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            </figure>
          )}

          <p>
            <strong>사용자명:</strong> {user.username}
          </p>
          <p>
            <strong>이메일:</strong> {user.email}
          </p>
          <p>
            <strong>권한:</strong> {user.role}
          </p>
        </div>
      </div>
    </div>
  );
}
