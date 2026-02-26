// 공통 타입 정의

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 사용자 타입
export interface User {
  id: number;
  email: string;
  username: string;
  nickname?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

// 책 소유자 타입
export interface BookOwner {
  id: number;
  username: string;
  profileImageUrl?: string | null;
}

// 책 타입
export interface Book {
  id: number;
  title: string;
  meta?: string;
  cover?: string;
  link?: string;
  comment?: string;
  uploadDate: string;
  uploadedBy: BookOwner;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
}

// 댓글 타입
export interface Comment {
  id: number;
  content: string;
  createdBy: BookOwner;
  createdAt: string;
  updatedAt: string;
}

// 페이지 응답 타입 (Spring Page 구조)
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  page: number;
  number?: number;
  first: boolean;
  last: boolean;
  empty?: boolean;
}

// 알라딘 검색 결과 타입
export interface AladinSearchBook {
  title: string;
  meta?: string;
  cover?: string;
  link: string;
  isbn13?: string;
  source?: string;
}

// 공지사항 타입
export interface Notice {
  id: number;
  title: string;
  content?: string;
  topFixed?: boolean;
  createdAt: string;
}

// 문의 타입
export interface Inquiry {
  id: number;
  contact: string;
  content: string;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

// 관리자 대시보드 타입
export interface Dashboard {
  totalBooks: number;
  pendingInquiries: number;
  confirmedInquiries: number;
}

// 에러 타입
export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
}
