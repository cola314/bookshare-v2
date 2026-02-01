package com.bookshare

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BookshareApplication

fun main(args: Array<String>) {
    runApplication<BookshareApplication>(*args)
}
