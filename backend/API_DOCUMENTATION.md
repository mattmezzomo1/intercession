# Intercede Together - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow this format:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123",
  "avatar": "https://example.com/avatar.jpg",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "city": "São Paulo",
  "country": "Brazil",
  "timezone": "America/Sao_Paulo",
  "languages": ["language_id_1", "language_id_2"]
}
```

#### POST /auth/login
Login user.
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Get current user profile (requires auth).

### Users

#### GET /users/profile
Get user profile (requires auth).

#### PUT /users/profile
Update user profile (requires auth).
```json
{
  "name": "New Name",
  "avatar": "https://example.com/new-avatar.jpg",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "city": "São Paulo",
  "country": "Brazil",
  "timezone": "America/Sao_Paulo"
}
```

#### GET /users/stats
Get user statistics (requires auth).

#### GET /users/prayer-requests
Get user's prayer requests (requires auth).
Query params: `page`, `limit`, `status`

#### DELETE /users/account
Delete user account (requires auth).

### Prayer Requests

#### GET /prayer-requests
Get prayer requests (optional auth for personalization).
Query params: `page`, `limit`, `category`, `urgent`, `status`, `userId`, `language`, `latitude`, `longitude`, `maxDistance`

#### GET /prayer-requests/trending
Get trending prayer requests (optional auth).
Query params: `page`, `limit`, `language`

#### GET /prayer-requests/:id
Get specific prayer request (optional auth).

#### POST /prayer-requests
Create prayer request (requires auth).
```json
{
  "content": "Please pray for my health",
  "urgent": false,
  "privacy": "PUBLIC",
  "categoryId": "category_id",
  "languageId": "language_id",
  "images": ["https://example.com/image1.jpg"],
  "latitude": -23.5505,
  "longitude": -46.6333,
  "city": "São Paulo",
  "country": "Brazil"
}
```

#### PUT /prayer-requests/:id
Update prayer request (requires auth).

#### DELETE /prayer-requests/:id
Delete prayer request (requires auth).

### Intercessions

#### GET /intercessions/prayer-request/:prayerRequestId
Get intercessions for a prayer request (optional auth).
Query params: `page`, `limit`

#### POST /intercessions
Create intercession (requires auth).
```json
{
  "prayerRequestId": "prayer_request_id",
  "comment": "Praying for you!"
}
```

#### DELETE /intercessions/:id
Delete intercession (requires auth).

### Comments

#### GET /comments/prayer-request/:prayerRequestId
Get comments for a prayer request (optional auth).
Query params: `page`, `limit`

#### POST /comments
Create comment (requires auth).
```json
{
  "prayerRequestId": "prayer_request_id",
  "content": "God bless you!"
}
```

#### PUT /comments/:id
Update comment (requires auth).
```json
{
  "content": "Updated comment"
}
```

#### DELETE /comments/:id
Delete comment (requires auth).

### Word of Day

#### GET /word-of-day/today
Get today's word of day (optional auth for language preference).
Query params: `language` (language code, e.g., 'pt', 'en')

#### GET /word-of-day/dates
Get available word of day dates.
Query params: `language`

#### GET /word-of-day/:date
Get word of day for specific date (optional auth).
Query params: `language`

#### POST /word-of-day
Create word of day (requires auth).
```json
{
  "date": "2025-01-01T00:00:00.000Z",
  "word": "HOPE",
  "verse": "Bible verse text",
  "reference": "John 3:16",
  "devotionalTitle": "Title",
  "devotionalContent": "Content",
  "devotionalReflection": "Reflection",
  "prayerTitle": "Prayer Title",
  "prayerContent": "Prayer Content",
  "prayerDuration": "2 minutes",
  "languageId": "language_id"
}
```

### Categories

#### GET /categories
Get all categories.

#### GET /categories/:slug
Get category by slug.

#### POST /categories
Create category (requires auth).
```json
{
  "name": "Health",
  "slug": "health"
}
```

#### PUT /categories/:id
Update category (requires auth).

#### DELETE /categories/:id
Delete category (requires auth).

### Languages

#### GET /languages
Get all languages.

#### GET /languages/user
Get user's languages (requires auth).

#### PUT /languages/user
Update user's languages (requires auth).
```json
{
  "languages": [
    {
      "languageId": "language_id_1",
      "isPrimary": true
    },
    {
      "languageId": "language_id_2",
      "isPrimary": false
    }
  ]
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Features

### Location-based Filtering
Prayer requests can be filtered by proximity using latitude, longitude, and maxDistance parameters.

### Multi-language Support
Content is available in multiple languages. Users can set their preferred languages.

### Privacy Levels
Prayer requests support three privacy levels:
- `PUBLIC` - Visible to everyone
- `PRIVATE` - Visible only to the author
- `FRIENDS` - Visible to friends (not implemented yet)

### Image Support
Prayer requests can include up to 5 images.

### Real-time Features
The API is designed to support real-time features through WebSocket connections (to be implemented).
