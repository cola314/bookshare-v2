import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string | number;
  email: string;
  username: string;
  profileImageUrl?: string | null;
  role: string;
}

interface AuthState {
  // 상태
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // 액션
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      // 사용자 정보 설정
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      // 토큰 설정
      setAccessToken: (token) =>
        set({
          accessToken: token,
        }),

      // 로그인
      login: (token, user, refreshToken) =>
        set({
          accessToken: token,
          refreshToken: refreshToken || null,
          user,
          isAuthenticated: true,
        }),

      // 로그아웃
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      // 하이드레이션 상태 설정
      setHydrated: (state) =>
        set({
          isHydrated: state,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // 토큰과 사용자 정보 모두 localStorage에 저장
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
