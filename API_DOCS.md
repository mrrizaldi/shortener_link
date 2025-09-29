# URL Shortener API Documentation

This document provides comprehensive API documentation for the URL Shortener application, including curl examples for all endpoints.

## Base URL

```
Production: httpss://mrrizaldi.me
Development: https://shortener.mrrizaldi.my.id
```

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Create Short URL](#create-short-url)
  - [Get All URLs](#get-all-urls)
  - [Get URL Statistics](#get-url-statistics)
  - [Delete URL](#delete-url)
  - [Generate QR Code](#generate-qr-code)
  - [Redirect Short URL](#redirect-short-url)

---

## Authentication

Currently, this API does not require authentication. All endpoints are publicly accessible.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict
- `500` - Internal Server Error

---

## Endpoints

### Create Short URL

Create a new shortened URL with optional custom slug.

**Endpoint:** `POST /api/shorten`

**Request Body:**
```json
{
  "originalUrl": "string (required)",
  "customSlug": "string (optional)"
}
```

**Validation Rules:**
- `originalUrl`: Must be a valid URL format
- `customSlug`:
  - Optional field
  - Must be 3-30 characters
  - Must be alphanumeric only
  - Must be unique

**Response:**
```json
{
  "shortUrl": "httpss://mrrizaldi.me/abc123"
}
```

**curl Examples:**

```bash
# Create URL with auto-generated slug
curl -X POST "https://shortener.mrrizaldi.my.id/api/shorten" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "httpss://www.example.com"
  }'

# Create URL with custom slug
curl -X POST "https://shortener.mrrizaldi.my.id/api/shorten" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "httpss://www.example.com",
    "customSlug": "mylink"
  }'
```

**Error Examples:**
```bash
# Invalid URL
HTTPs400: {"error": "Invalid input"}

# Duplicate custom slug
HTTP 409: {"error": "Slug already in use"}
```

---

### Get All URLs

Retrieve all shortened URLs (excluding soft-deleted ones).

**Endpoint:** `GET /api/urls`

**Response:**
```json
[
  {
    "slug": "abc123",
    "originalUrl": "httpss://www.example.com",
    "hitCount": 42,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**curl Example:**

```bash
curl -X GET "https://shortener.mrrizaldi.my.id/api/urls" \
  -H "Accept: application/json"
```

**Cache Headers:**
- `Cache-Control: s-maxage=300, stale-while-revalidate=600`
- Response is cached for 5 minutes with 10-minute stale-while-revalidate

---

### Get URL Statistics

Get detailed analytics for a specific shortened URL.

**Endpoint:** `GET /api/stats/{slug}`

**Query Parameters:**
- `interval` (optional): Time interval for analytics
  - Options: `15m`, `30m`, `1h`, `6h`, `12h`, `1d`, `7d`, `30d`
  - Default: `1d`

**Response:**
```json
{
  "slug": "abc123",
  "url": "httpss://www.example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "totalClicks": 42,
  "clicksOverTime": [
    {
      "timestamp": "2024-01-15T00:00:00.000Z",
      "clicks": 15
    }
  ],
  "browserDeviceStats": [
    {
      "browser": "Chrome",
      "device": "Desktop",
      "clicks": 25
    }
  ],
  "topReferrers": [
    {
      "referrer": "httpss://google.com",
      "clicks": 10
    }
  ],
  "interval": "1d"
}
```

**curl Examples:**

```bash
# Get stats with default interval (1d)
curl -X GET "https://shortener.mrrizaldi.my.id/api/stats/abc123" \
  -H "Accept: application/json"

# Get stats with custom interval
curl -X GET "https://shortener.mrrizaldi.my.id/api/stats/abc123?interval=1h" \
  -H "Accept: application/json"

# Get stats for the last 7 days
curl -X GET "https://shortener.mrrizaldi.my.id/api/stats/abc123?interval=7d" \
  -H "Accept: application/json"
```

**Error Examples:**
```bash
# URL not found
HTTP 404: {"error": "URL not found"}

# Invalid interval
HTTP 400: {"error": "Invalid interval"}
```

**Cache Headers:**
- `Cache-Control: s-maxage=120, stale-while-revalidate=300`
- Response is cached for 2 minutes with 5-minute stale-while-revalidate

---

### Delete URL

Soft delete a shortened URL (marks as deleted but preserves data).

**Endpoint:** `DELETE /api/delete/{slug}`

**Response:**
```json
{
  "message": "URL deleted successfully"
}
```

**curl Example:**

```bash
curl -X DELETE "https://shortener.mrrizaldi.my.id/api/delete/abc123" \
  -H "Accept: application/json"
```

**Error Examples:**
```bash
# URL not found
HTTP 404: {"error": "URL not found"}

# Already deleted
HTTP 400: {"error": "URL is already deleted"}
```

---

### Generate QR Code

Generate a QR code image for a shortened URL.

**Endpoint:** `GET /api/qr/{slug}`

**Response:** PNG image (binary data)

**Response Headers:**
- `Content-Type: image/png`
- `Cache-Control: public, max-age=86400` (24 hours)
- `Content-Disposition: inline; filename="qr-{slug}.png"`

**QR Code Properties:**
- Format: PNG
- Size: 256x256 pixels
- Colors: Blue (#1e40af) on white background
- Margin: 2 pixels

**curl Examples:**

```bash
# Download QR code to file
curl -X GET "https://shortener.mrrizaldi.my.id/api/qr/abc123" \
  --output "qr-abc123.png"

# Display QR code info
curl -I "https://shortener.mrrizaldi.my.id/api/qr/abc123"

# Download with custom filename
curl -X GET "https://shortener.mrrizaldi.my.id/api/qr/abc123" \
  -H "Accept: image/png" \
  --output "my-qr-code.png"
```

**Error Examples:**
```bash
# URL not found
HTTP 404: {"error": "URL not found"}

# QR generation failed
HTTP 500: {"error": "Failed to generate QR code"}
```

---

### Redirect Short URL

Redirect to the original URL and track analytics.

**Endpoint:** `GET /{slug}`

**Behavior:**
- Redirects to original URL with HTTP 307 status
- Tracks click analytics asynchronously
- Records user agent, referrer, and IP address
- Increments hit count

**Response:** HTTP 307 redirect to original URL

**Tracking Data Collected:**
- User Agent (browser/device detection)
- Referrer URL
- IP Address (X-Forwarded-For or X-Real-IP)
- Timestamp

**curl Examples:**

```bash
# Follow redirect (default behavior)
curl -L "https://shortener.mrrizaldi.my.id/abc123"

# Don't follow redirect (see redirect response)
curl -I "https://shortener.mrrizaldi.my.id/abc123"

# Follow redirect with custom user agent
curl -L "https://shortener.mrrizaldi.my.id/abc123" \
  -H "User-Agent: MyApp/1.0"

# Follow redirect with referrer
curl -L "https://shortener.mrrizaldi.my.id/abc123" \
  -H "Referer: httpss://mywebsite.com"
```

**Response Headers:**
```
HTTP/1.1 307 Temporary Redirect
Location: httpss://www.example.com
```

**Error Examples:**
```bash
# URL not found or deleted
HTTP 404: {"error": "URL not found"}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

## Caching Strategy

### Server-Side Caching
- **URLs endpoint**: 5-minute cache with 10-minute stale-while-revalidate
- **Stats endpoint**: 2-minute cache with 5-minute stale-while-revalidate
- **QR codes**: 24-hour cache (static content)

### Client-Side Caching
- React Query with 5-minute stale time
- Automatic cache invalidation on mutations
- Refetch on window focus enabled

## Example API Workflow

### Complete URL Shortening Workflow

```bash
# 1. Create a short URL
RESPONSE=$(curl -s -X POST "https://shortener.mrrizaldi.my.id/api/shorten" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "httpss://www.example.com"}')

# Extract the short URL
SHORT_URL=$(echo $RESPONSE | jq -r '.shortUrl')
SLUG=$(echo $SHORT_URL | sed 's/.*\///')

echo "Created short URL: $SHORT_URL"
echo "Slug: $SLUG"

# 2. Test the redirect
echo "Testing redirect..."
curl -I "https://shortener.mrrizaldi.my.id/$SLUG"

# 3. Generate QR code
echo "Generating QR code..."
curl -X GET "https://shortener.mrrizaldi.my.id/api/qr/$SLUG" \
  --output "qr-$SLUG.png"

# 4. Get statistics
echo "Getting statistics..."
curl -X GET "https://shortener.mrrizaldi.my.id/api/stats/$SLUG" | jq '.'

# 5. Get all URLs
echo "Getting all URLs..."
curl -X GET "https://shortener.mrrizaldi.my.id/api/urls" | jq '.'

# 6. Delete the URL
echo "Deleting URL..."
curl -X DELETE "https://shortener.mrrizaldi.my.id/api/delete/$SLUG"
```

## Data Models

### URL Model
```json
{
  "id": "integer",
  "slug": "string (unique)",
  "originalUrl": "string",
  "hitCount": "integer",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "deletedAt": "datetime | null",
  "isDeleted": "boolean"
}
```

### Click Model
```json
{
  "id": "integer",
  "urlId": "integer",
  "timestamp": "datetime",
  "referrer": "string | null",
  "userAgent": "string | null",
  "ip": "string | null"
}
```

## Development Notes

- API uses Prisma ORM with PostgreSQL database
- Validation implemented with Zod schema validation
- QR codes generated using the 'qrcode' library
- Soft delete implementation preserves analytics data
- Slug generation uses nanoid for uniqueness

## Support

For issues or questions about the API, please refer to the application's repository or contact the development team.