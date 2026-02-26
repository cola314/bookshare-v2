"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/auth/register", {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        nickname: formData.nickname,
      });

      router.push("/login?registered=true");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4">
            <h1 className="title has-text-centered">회원가입</h1>

            {error && (
              <div className="notification is-danger is-light">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">이메일</label>
                <div className="control">
                  <input
                    className="input"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">사용자명</label>
                <div className="control">
                  <input
                    className="input"
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="홍길동"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">닉네임</label>
                <div className="control">
                  <input
                    className="input"
                    id="nickname"
                    name="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder="사용할 닉네임"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">비밀번호</label>
                <div className="control">
                  <input
                    className="input"
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="8자 이상 입력하세요"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">비밀번호 확인</label>
                <div className="control">
                  <input
                    className="input"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="button is-primary is-fullwidth"
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </button>
            </form>

            <p className="has-text-centered mt-4">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="has-text-link">로그인</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
