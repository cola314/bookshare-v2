import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// localStorage에서 토큰 가져오기 (클라이언트 사이드에서만)
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.accessToken || null;
    }
  } catch {
    return null;
  }
  return null;
};

// 토큰 삭제 (클라이언트 사이드에서만)
const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth-storage");
};

// Axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // 인증 에러 시 토큰 삭제 후 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined") {
        clearAuthStorage();
        window.location.href = "/login?error=SessionExpired";
      }
    } else if (status === 403) {
      // 권한 없음 에러
      if (typeof window !== "undefined") {
        window.location.href = "/unauthorized";
      }
    }

    return Promise.reject(error);
  }
);

// API 요청 헬퍼 함수
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

// 서버 사이드용 API 인스턴스 (토큰을 직접 전달)
export function createServerApi(accessToken?: string): AxiosInstance {
  const serverApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  return serverApi;
}

// ============= 책 관련 API =============
import type { Book, Comment, PageResponse, Notice, Inquiry, Dashboard } from "@/types";

// 책 목록 조회
export async function getBooks(page: number = 0): Promise<PageResponse<Book>> {
  return apiGet<PageResponse<Book>>(`/api/books?page=${page}&size=12`);
}

// 책 상세 조회
export async function getBook(id: number): Promise<Book> {
  return apiGet<Book>(`/api/books/${id}`);
}

// 책 등록
export async function createBook(
  link: string,
  comment: string
): Promise<Book> {
  return apiPost<Book>("/api/books", { link, comment });
}

// 책 수정
export async function updateBook(
  id: number,
  comment: string
): Promise<Book> {
  return apiPut<Book>(`/api/books/${id}`, { comment });
}

// 책 삭제
export async function deleteBook(id: number): Promise<void> {
  return apiDelete<void>(`/api/books/${id}`);
}

// 좋아요 토글
export async function toggleLike(id: number): Promise<{ liked: boolean; likeCount: number }> {
  return apiPost<{ liked: boolean; likeCount: number }>(`/api/books/${id}/like`);
}

// 사용자별 책 목록 조회
export async function getBooksByUser(
  userId: number,
  page: number = 0
): Promise<PageResponse<Book>> {
  return apiGet<PageResponse<Book>>(`/api/users/${userId}/books?page=${page}&size=12`);
}

// ============= 댓글 관련 API =============

// 댓글 목록 조회
export async function getComments(bookId: number): Promise<Comment[]> {
  return apiGet<Comment[]>(`/api/books/${bookId}/comments`);
}

// 댓글 작성
export async function createComment(
  bookId: number,
  content: string
): Promise<Comment> {
  return apiPost<Comment>(`/api/books/${bookId}/comments`, { content });
}

// 댓글 삭제
export async function deleteComment(commentId: number): Promise<void> {
  return apiDelete<void>(`/api/comments/${commentId}`);
}

// ============= 공지사항 관련 API =============

// 공지 목록 조회
export async function getNotices(page: number = 0): Promise<PageResponse<Notice>> {
  return apiGet<PageResponse<Notice>>(`/api/notices?page=${page}&size=10`);
}

// 공지 상세 조회
export async function getNotice(id: number): Promise<Notice> {
  return apiGet<Notice>(`/api/notices/${id}`);
}

// ============= 문의 관련 API =============

// 문의 등록 (비로그인 가능)
export async function createInquiry(contact: string, content: string): Promise<Inquiry> {
  return apiPost<Inquiry>("/api/inquiries", { contact, content });
}

// ============= 관리자 API =============

// 관리자 대시보드 조회
export async function getDashboard(): Promise<Dashboard> {
  return apiGet<Dashboard>("/api/admin/dashboard");
}

// 문의 목록 조회 (관리자)
export async function getInquiries(): Promise<Inquiry[]> {
  return apiGet<Inquiry[]>("/api/admin/inquiries");
}

// 문의 처리 완료 (관리자)
export async function confirmInquiry(id: number): Promise<Inquiry> {
  return apiPatch<Inquiry>(`/api/admin/inquiries/${id}/confirm`);
}

// ============= 홈페이지 API =============

// 홈페이지 데이터 조회 (총 책 수)
export async function getHomeStats(): Promise<{ totalBooks: number }> {
  return apiGet<{ totalBooks: number }>("/api/stats");
}

// 최근 공지사항 조회 (5개)
export async function getRecentNotices(): Promise<Notice[]> {
  return apiGet<Notice[]>("/api/notices/recent");
}

export default api;
