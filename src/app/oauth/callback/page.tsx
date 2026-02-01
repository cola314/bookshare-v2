"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setTimeout(() => {
        router.push("/login?error=OAuthFailed");
      }, 2000);
      return;
    }

    if (accessToken) {
      try {
        // user 정보가 있으면 파싱
        let user = null;
        if (userParam) {
          try {
            user = JSON.parse(decodeURIComponent(userParam));
          } catch {
            // user 파싱 실패 시 기본값 사용
            user = {
              id: "",
              email: "",
              name: "사용자",
              role: "USER",
            };
          }
        } else {
          // user 정보가 없으면 기본값 사용
          user = {
            id: "",
            email: "",
            name: "사용자",
            role: "USER",
          };
        }

        // 토큰과 사용자 정보 저장
        login(accessToken, user, refreshToken || undefined);

        // 홈페이지로 리다이렉트
        router.push("/");
      } catch {
        setError("로그인 처리 중 오류가 발생했습니다.");
        setTimeout(() => {
          router.push("/login?error=OAuthFailed");
        }, 2000);
      }
    } else {
      setError("토큰이 없습니다.");
      setTimeout(() => {
        router.push("/login?error=NoToken");
      }, 2000);
    }
  }, [searchParams, login, router]);

  if (error) {
    return (
      <section className="section is-flex is-align-items-center is-justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="container has-text-centered">
          <div className="notification is-danger">
            <p>{error}</p>
          </div>
          <p className="mt-4">잠시 후 로그인 페이지로 이동합니다...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section is-flex is-align-items-center is-justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="container has-text-centered">
        <p className="mb-4">로그인 처리 중...</p>
      </div>
    </section>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <section className="section is-flex is-align-items-center is-justify-content-center" style={{ minHeight: "100vh" }}>
          <div className="container has-text-centered">
            <p>로딩 중...</p>
          </div>
        </section>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
