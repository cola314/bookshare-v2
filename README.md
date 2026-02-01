# BookShare Backend

Kotlin Spring Boot backend for the BookShare application.

## Tech Stack

- **Language**: Kotlin 1.9.25
- **Framework**: Spring Boot 3.4.1
- **Database**: PostgreSQL (production) / H2 (local development)
- **Authentication**: OAuth2 (Google, Kakao, Naver) + JWT
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Gradle 8.12

## Requirements

- Java 21+
- Gradle 8.12+
- PostgreSQL 15+ (for production)

## Getting Started

### Local Development

```bash
# Run with H2 in-memory database
./gradlew bootRun

# Or specify local profile explicitly
./gradlew bootRun --args='--spring.profiles.active=local'
```

The application will start at `http://localhost:8080`

### Production

```bash
# Build the JAR file
./gradlew bootJar

# Run with production profile
java -jar build/libs/bookshare-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## API Documentation

After starting the application, access the Swagger UI:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

## Profiles

| Profile | Database | DDL Auto | Description |
|---------|----------|----------|-------------|
| `local` | H2 (in-memory) | create-drop | Local development with H2 console |
| `prod` | PostgreSQL | validate | Production environment |

## Environment Variables

### Required for Production

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `local` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `bookshare` |
| `DB_USERNAME` | Database username | `bookshare` |
| `DB_PASSWORD` | Database password | `bookshare` |

### JWT Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret (min 32 chars) | (development default) |
| `JWT_EXPIRATION` | Access token expiration (ms) | `86400000` (24h) |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration (ms) | `604800000` (7d) |

### OAuth2 Configuration

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `KAKAO_CLIENT_ID` | Kakao OAuth2 client ID |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth2 client secret |
| `NAVER_CLIENT_ID` | Naver OAuth2 client ID |
| `NAVER_CLIENT_SECRET` | Naver OAuth2 client secret |

### Application Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `SERVER_PORT` | Server port | `8080` |

## Docker

### Build Image

```bash
docker build -t bookshare-backend .
```

### Run Container

```bash
docker run -d \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  -e JWT_SECRET=your-jwt-secret \
  bookshare-backend
```

## Health Check

- **Basic**: `GET /api/health`
- **Detailed**: `GET /api/health/info`

```bash
curl http://localhost:8080/api/health
```

Response:
```json
{
  "status": "UP",
  "timestamp": "2024-01-01T12:00:00",
  "profile": "local"
}
```

## Project Structure

```
src/main/kotlin/com/bookshare/
├── BookshareApplication.kt     # Main application
├── api/                        # REST controllers
│   ├── auth/                   # Authentication endpoints
│   ├── dto/                    # Data transfer objects
│   ├── BookController.kt
│   ├── CommentController.kt
│   └── HealthController.kt
├── common/
│   └── exception/              # Exception handling
├── config/
│   ├── jwt/                    # JWT configuration
│   ├── oauth/                  # OAuth2 configuration
│   ├── OpenApiConfig.kt
│   └── SecurityConfig.kt
├── domain/                     # Domain entities & repositories
│   ├── book/
│   ├── user/
│   ├── notice/
│   ├── inquiry/
│   └── error/
└── infra/
    └── crawler/                # Web crawler for book info
```

## Testing

```bash
# Run all tests
./gradlew test

# Run with coverage report
./gradlew test jacocoTestReport
```

## License

MIT License
