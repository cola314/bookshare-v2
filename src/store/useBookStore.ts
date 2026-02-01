import { create } from "zustand";
import type { Book, Comment, PageResponse } from "@/types";

interface BookFilters {
  keyword?: string;
  page: number;
  size: number;
}

interface BookState {
  // 책 목록 상태
  books: Book[];
  currentBook: Book | null;
  comments: Comment[];

  // 페이지네이션
  filters: BookFilters;
  totalPages: number;
  totalElements: number;

  // UI 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  setBooks: (books: Book[]) => void;
  setCurrentBook: (book: Book | null) => void;
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  removeComment: (commentId: number) => void;
  setFilters: (filters: Partial<BookFilters>) => void;
  setPagination: (response: PageResponse<Book>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateBookLike: (bookId: number, liked: boolean, likeCount: number) => void;
  reset: () => void;
}

const initialFilters: BookFilters = {
  keyword: "",
  page: 0,
  size: 12,
};

export const useBookStore = create<BookState>((set) => ({
  // 초기 상태
  books: [],
  currentBook: null,
  comments: [],
  filters: initialFilters,
  totalPages: 0,
  totalElements: 0,
  isLoading: false,
  error: null,

  // 책 목록 설정
  setBooks: (books) => set({ books }),

  // 현재 책 설정
  setCurrentBook: (book) => set({ currentBook: book }),

  // 댓글 목록 설정
  setComments: (comments) => set({ comments }),

  // 댓글 추가
  addComment: (comment) =>
    set((state) => ({
      comments: [comment, ...state.comments],
      currentBook: state.currentBook
        ? { ...state.currentBook, commentCount: state.currentBook.commentCount + 1 }
        : null,
    })),

  // 댓글 삭제
  removeComment: (commentId) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId),
      currentBook: state.currentBook
        ? { ...state.currentBook, commentCount: Math.max(0, state.currentBook.commentCount - 1) }
        : null,
    })),

  // 필터 설정
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  // 페이지네이션 정보 설정
  setPagination: (response) =>
    set({
      books: response.content,
      totalPages: response.totalPages,
      totalElements: response.totalElements,
    }),

  // 로딩 상태 설정
  setLoading: (isLoading) => set({ isLoading }),

  // 에러 설정
  setError: (error) => set({ error }),

  // 좋아요 상태 업데이트
  updateBookLike: (bookId, liked, likeCount) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId ? { ...book, isLiked: liked, likeCount } : book
      ),
      currentBook:
        state.currentBook?.id === bookId
          ? { ...state.currentBook, isLiked: liked, likeCount }
          : state.currentBook,
    })),

  // 상태 초기화
  reset: () =>
    set({
      books: [],
      currentBook: null,
      comments: [],
      filters: initialFilters,
      totalPages: 0,
      totalElements: 0,
      isLoading: false,
      error: null,
    }),
}));
