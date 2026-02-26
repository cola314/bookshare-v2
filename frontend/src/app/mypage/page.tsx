"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, setUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?callbackUrl=/mypage");
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const trimmedUsername = username.trim();
    setError("");
    setSuccess("");

    if (!trimmedUsername) {
      setError("사용자명을 입력해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.patch("/api/auth/me", {
        username: trimmedUsername,
      });

      const updatedUser = response.data as {
        id: number | string;
        email: string;
        username: string;
        role: string;
        profileImageUrl?: string | null;
      };

      setUser({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        profileImageUrl: updatedUser.profileImageUrl ?? null,
      });

      setUsername(updatedUser.username);
      setSuccess("사용자명이 변경되었습니다.");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "사용자명 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="section">
        <div className="container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const isUnchanged = username.trim() === user.username;

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

          <form onSubmit={handleSubmit} className="mb-4">
            <div className="field">
              <label className="label">사용자명</label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <input
                    className="input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength={2}
                    maxLength={50}
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="control">
                  <button
                    className={`button is-primary ${isSaving ? "is-loading" : ""}`}
                    type="submit"
                    disabled={isSaving || isUnchanged || username.trim().length < 2}
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </form>

          {error && <div className="notification is-danger is-light">{error}</div>}
          {success && <div className="notification is-success is-light">{success}</div>}

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
