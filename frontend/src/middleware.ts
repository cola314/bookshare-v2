import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 목록
const protectedPaths = [
  "/books/upload",
  "/books/edit",
  "/mypage",
  "/inquiry/write",
];

// 인증된 사용자가 접근하면 안 되는 경로 (로그인/회원가입)
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OAuth 콜백 경로는 인증 체크 제외
  if (pathname.startsWith("/oauth/callback")) {
    return NextResponse.next();
  }

  // 클라이언트 사이드에서 인증 상태를 관리하므로,
  // 서버 사이드 미들웨어에서는 기본적인 라우팅만 처리합니다.
  // 보호된 경로에 대한 실제 인증 체크는 클라이언트 컴포넌트에서 수행합니다.

  // 인증이 필요한 경로인지 확인
  const isProtectedPath = protectedPaths.some(
    (path) => pathname.startsWith(path) || pathname === path
  );

  // 인증 경로인지 확인 (로그인/회원가입)
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // 서버 사이드에서는 쿠키나 헤더로 인증 상태를 확인할 수 없으므로
  // (localStorage 기반이기 때문에) 클라이언트에서 리다이렉트 처리를 합니다.
  // 여기서는 단순히 요청을 통과시킵니다.

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|manifest.json|sw.js|workbox-*).*)",
  ],
};
