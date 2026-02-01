"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errorParam === "SessionExpired" ? "세션이 만료되었습니다. 다시 로그인해주세요." : ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push(callbackUrl);
  }, [isAuthenticated, router, callbackUrl]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const data = response.data;
      if (data.accessToken && data.user) {
        login(data.accessToken, data.user, data.refreshToken);
        router.push(callbackUrl);
      } else {
        setError("로그인 응답이 올바르지 않습니다.");
      }
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setError("");
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4">
            <h1 className="title has-text-centered">로그인</h1>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="button is-fullwidth mb-4"
            >
              {isGoogleLoading ? "로그인 중..." : "Google로 로그인"}
            </button>

            <hr />

            {error && (
              <div className="notification is-danger is-light">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">이메일</label>
                <div className="control">
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">비밀번호</label>
                <div className="control">
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="button is-primary is-fullwidth"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <p className="has-text-centered mt-4">
              아직 계정이 없으신가요?{" "}
              <Link href="/register" className="has-text-link">회원가입</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container"><p>로딩 중...</p></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
