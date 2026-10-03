# Mobile API Documentation

## Overview

The Plenty Value Hub Mobile API is designed for iOS, Android, and other mobile applications. Mobile clients automatically bypass CSRF token requirements based on user agent detection, while maintaining security through token-based authentication.

## Mobile Client Detection

The API automatically detects mobile clients based on user agent patterns:

- Android
- iOS (iPhone, iPad, iPod)
- WebOS
- Windows Phone
- Blackberry
- React Native
- Flutter
- Expo

When a mobile client is detected:
- CSRF token validation is skipped
- Response includes `X-Mobile-Client: true` header
- Token-based authentication is recommended

## Authentication

### Token-Based Authentication (Recommended)

Mobile apps should use Bearer tokens instead of session cookies:

```
Authorization: Bearer <your_access_token>
```

Token features:
- 24-hour expiration (configurable)
- No CSRF token required
- Works across all mobile platforms
- Compatible with standard OAuth/JWT flows

### API Key Authentication

Alternative authentication method:

```
X-API-Key: <your_api_key>
```

## Required Headers

Include these headers in all requests:

```
User-Agent: Your Mobile App/1.0.0 (Platform; OS Version)
X-App-Version: 1.0.0
X-Platform: ios | android
```

## Optional Headers

```
X-Device-Id: unique-device-identifier
X-Device-Name: Device Name
```

## Endpoints

### Public Endpoints

#### Get App Configuration
```
GET /api/mobile/config
```

Returns:
- Current API version
- Minimum required app version
- Available features
- Endpoint URLs
- CSRF exemption status

#### Health Check
```
GET /api/mobile/health
```

Returns:
- Server status
- Current API version
- Timestamp

#### Get Mobile API Help
```
GET /api/mobile/help
```

Returns:
- Full API documentation
- Authentication methods
- Available endpoints
- Pagination info
- Required headers

#### Get Device Info
```
GET /api/mobile/device-info
```

Returns:
- User agent
- App version
- Platform
- Device ID
- Mobile client detection status

#### Report Error/Crash
```
POST /api/mobile/errors/report

Request:
{
  "errorMessage": "Error description",
  "errorStack": "Stack trace",
  "platform": "ios | android",
  "appVersion": "1.0.0",
  "deviceId": "device-id"
}

Response:
{
  "success": true,
  "data": {
    "errorId": "error-id",
    "message": "Error report logged successfully"
  }
}
```

### Authenticated Endpoints

#### Register Device for Push Notifications
```
POST /api/mobile/devices/register
Authorization: Bearer <token>

Request:
{
  "deviceToken": "push-notification-token",
  "platform": "ios | android",
  "deviceId": "unique-device-id",
  "deviceName": "iPhone 13 Pro"
}

Response:
{
  "success": true,
  "data": {
    "userId": 123,
    "deviceToken": "token...",
    "platform": "ios",
    "registeredAt": "2024-10-02T12:00:00Z"
  }
}
```

#### Validate Token
```
POST /api/mobile/token/validate
Authorization: Bearer <token>

Response:
{
  "success": true,
  "valid": true,
  "data": {
    "userId": 123,
    "email": "user@example.com",
    "role": "affiliate",
    "tokenValid": true
  }
}
```

## Reusable Endpoints

Mobile clients have access to all standard API endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`
- **Users**: `/api/users/profile`, `/api/users/update`
- **Products**: `/api/products`, `/api/products/:id`
- **Orders**: `/api/orders`, `/api/orders/:id`
- **Campaigns**: `/api/campaigns`, `/api/campaigns/:id`
- **Commissions**: `/api/commissions`, `/api/commissions/:id`
- **Affiliates**: `/api/affiliates/top-performers`, `/api/affiliates/tier/:tier`
- **Disputes**: `/api/disputes`, `/api/disputes/:id`

**Note**: Mobile clients do not need CSRF tokens for these endpoints.

## Pagination

Standard pagination parameters:

```
GET /api/endpoint?page=1&limit=20
```

- Default limit: 20
- Maximum limit: 100
- Parameters: `page`, `limit`

Response includes:

```json
{
  "success": true,
  "data": [...],
  "paging": {
    "total": 150,
    "perPage": 20,
    "currentPage": 1,
    "lastPage": 8
  }
}
```

## Error Handling

Standard error response format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Best Practices

1. **Store tokens securely** - Use secure storage on device (Keychain on iOS, Keystore on Android)
2. **Refresh tokens** - Implement token refresh before expiration
3. **Handle errors gracefully** - Implement proper error handling and user feedback
4. **Validate app version** - Check response headers for minimum version requirements
5. **Use HTTPS only** - All API calls must use HTTPS
6. **Include device info** - Always send `X-Platform` and `X-App-Version` headers
7. **Implement offline support** - Cache responses for offline functionality
8. **Use pagination** - Always use pagination for list endpoints

## Rate Limiting

- General endpoints: 60 requests per minute
- Authentication endpoints: 5 requests per minute
- Error reporting: 100 requests per hour

## Version Management

Current version: **1.0.0**
Minimum app version: **1.0.0**

Check `/api/mobile/config` to determine if your app needs updating.

## Support

For API issues or questions:
- Check `/api/mobile/help` for detailed documentation
- Submit error reports to `/api/mobile/errors/report`
- Contact support at support@plenty-value-hub.com

## CSRF Note

**Mobile clients do not require CSRF tokens.** The API automatically detects mobile user agents and exempts them from CSRF validation. This is secure because:

1. Mobile apps don't have the same cross-origin vulnerability as browsers
2. Token-based authentication is used instead
3. Device tokens provide an additional security layer
4. All requests go through HTTPS

Web browsers still require CSRF tokens and cannot bypass this security measure.
