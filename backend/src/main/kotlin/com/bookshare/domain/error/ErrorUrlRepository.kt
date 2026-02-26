package com.bookshare.domain.error

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ErrorUrlRepository : JpaRepository<ErrorUrl, Long>
