package com.bookshare.domain.book

import com.bookshare.domain.user.User
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "books")
class Book(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var title: String,

    @Column(nullable = false)
    var meta: String,  // 저자, 출판사 등 메타정보

    @Column
    var cover: String? = null,  // 커버 이미지 URL

    @Column(nullable = false)
    var link: String,  // Aladin 링크

    @Column(columnDefinition = "TEXT")
    var comment: String? = null,  // 사용자 작성 설명

    @Column(nullable = false)
    var isDeleted: Boolean = false,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    var uploadedBy: User,

    @Column(nullable = false, updatable = false)
    val uploadDate: LocalDateTime = LocalDateTime.now(),

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "book_likes",
        joinColumns = [JoinColumn(name = "book_id")],
        inverseJoinColumns = [JoinColumn(name = "user_id")]
    )
    val likeUsers: MutableSet<User> = mutableSetOf()
) {
    fun addLike(user: User) {
        likeUsers.add(user)
    }

    fun removeLike(user: User) {
        likeUsers.remove(user)
    }

    fun isLikedBy(user: User): Boolean = likeUsers.contains(user)

    fun likeCount(): Int = likeUsers.size
}
