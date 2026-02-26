# Bookshare Frontend

책 공유 서비스 Bookshare의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **PWA**: next-pwa

## 시작하기

### 요구사항

- Node.js 20 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

```bash
# 환경 변수 파일 복사
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 필요한 환경 변수를 설정합니다.

| 환경 변수 | 설명 | 기본값 |
|-----------|------|--------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:8080` |
| `NEXT_PUBLIC_APP_URL` | 프론트엔드 앱 URL | `http://localhost:3000` |

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인합니다.

### 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm run start
```

## Docker

### 빌드

```bash
docker build -t bookshare-frontend .
```

### 실행

```bash
docker run -p 3000:3000 bookshare-frontend
```

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
├── components/           # 재사용 가능한 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트 (Header, Footer)
│   └── providers/       # 컨텍스트 프로바이더
├── lib/                  # 유틸리티 및 API 클라이언트
├── store/               # Zustand 상태 관리
├── types/               # TypeScript 타입 정의
└── middleware.ts        # Next.js 미들웨어
public/
├── icons/               # PWA 아이콘
└── manifest.json        # PWA 매니페스트
```

## PWA 기능

이 애플리케이션은 PWA(Progressive Web App)를 지원합니다.

- 오프라인 지원 (서비스 워커)
- 홈 화면에 추가 가능
- 앱과 유사한 사용자 경험

### 아이콘 교체

`public/icons/` 폴더의 아이콘 파일을 교체하여 앱 아이콘을 변경할 수 있습니다.

- `icon-192x192.png` (192x192 픽셀)
- `icon-512x512.png` (512x512 픽셀)

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |

## 라이선스

MIT License
