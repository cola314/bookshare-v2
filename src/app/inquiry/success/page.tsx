import Link from "next/link";

export default function InquirySuccessPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="mb-4">
          <h1 className="title">문의하기</h1>
        </div>
        <h2 className="subtitle">문의를 성공적으로 보냈습니다</h2>
        <Link href="/">메인 페이지로 가기</Link>
      </div>
    </div>
  );
}
