package com.bookshare.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.servers.Server
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun openAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("Bookshare API")
                    .description("Bookshare 서비스 API 문서")
                    .version("v1.0.0")
                    .contact(
                        Contact()
                            .name("Bookshare Team")
                            .email("contact@bookshare.com")
                    )
            )
            .servers(
                listOf(
                    Server().url("http://localhost:8080").description("Local Server")
                )
            )
    }
}
