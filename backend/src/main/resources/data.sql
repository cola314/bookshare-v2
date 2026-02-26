-- Update first user to ADMIN for testing (if exists)
UPDATE users SET role = 'ADMIN' WHERE id = 1;

-- Insert test notices
INSERT INTO notices (title, content, top_fixed, is_deleted, created_at, updated_at)
VALUES
('BookShare 서비스 오픈 안내', '안녕하세요! BookShare 서비스가 정식 오픈되었습니다. 많은 이용 부탁드립니다.', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('이용 가이드', '1. 알라딘 URL로 책을 등록하세요.\n2. 다른 사용자의 리뷰에 댓글을 남겨보세요.\n3. 마음에 드는 리뷰에 좋아요를 눌러주세요.', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('커뮤니티 이용 규칙', '건전한 커뮤니티 문화를 위해 다음 규칙을 지켜주세요:\n- 타인을 비방하는 글 금지\n- 광고성 게시물 금지\n- 저작권 침해 금지', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
