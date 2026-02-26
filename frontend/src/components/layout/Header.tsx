"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();
  const [isActive, setIsActive] = useState(false);

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item has-text-weight-bold is-size-4" href="/">
          BookShare
        </Link>

        <a
          role="button"
          className={`navbar-burger ${isActive ? "is-active" : ""}`}
          aria-label="menu"
          aria-expanded="false"
          onClick={() => setIsActive(!isActive)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className={`navbar-menu ${isActive ? "is-active" : ""}`}>
        <div className="navbar-start">
          <Link className="navbar-item" href="/books">책 목록</Link>
          <Link className="navbar-item" href="/books/upload">업로드</Link>
          <Link className="navbar-item" href="/notice">공지사항</Link>
          <Link className="navbar-item" href="/inquiry">문의</Link>
          {isHydrated && isAuthenticated && user && (
            <Link className="navbar-item" href={`/books?userId=${user.id}`}>내 서재</Link>
          )}
          {isHydrated && isAuthenticated && user?.role === "ADMIN" && (
            <Link className="navbar-item" href="/admin">관리</Link>
          )}
        </div>

        <div className="navbar-end">
          {isHydrated && isAuthenticated && user ? (
            <>
              <div className="navbar-item">
                <Link className="is-underlined has-text-dark" href="/mypage">
                  {user.username}
                </Link>
              </div>
              <div className="navbar-item">
                <div className="buttons">
                  <button className="button is-light" onClick={handleSignOut}>
                    로그아웃
                  </button>
                </div>
              </div>
            </>
          ) : isHydrated ? (
            <div className="navbar-item">
              <div className="buttons">
                <Link className="button is-primary" href="/login">
                  <strong>로그인</strong>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
