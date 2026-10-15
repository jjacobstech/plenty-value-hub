# API Rate Limiting Strategy

## Overview

Plenty Value Hub implements comprehensive rate limiting across all API endpoints to:
- Prevent abuse and DDoS attacks
- Ensure fair resource allocation
- Protect payment processing endpoints
- Manage database load
- Improve platform stability

Rate limiting is applied per IP address and uses time-window-based bucketing.

## Rate Limiting Tiers

### 1. Authentication Endpoints (authThrottle)
- **Limit**: 10 requests per 15 minutes
- **Block Duration**: 10 minutes after limit exceeded
- **Applied To**: 
  - `POST /auth/login`
  - `POST /auth/signup/verify-otp`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
- **Rationale**: Brute force protection for login attempts

### 2. Signup Endpoints (signupThrottle)
- **Limit**: 5 requests per hour
- **Applied To**:
  - `POST /auth/signup`
  - `POST /auth/signup/step1`
  - `POST /auth/signup/step2`
  - `POST /auth/signup/step3`
- **Rationale**: Slow account creation to prevent mass account farming

### 3. Admin Operations (adminThrottle)
- **Limit**: 100 requests per minute
- **Block Duration**: 2 minutes
- **Applied To**: Admin-only endpoints
- **Rationale**: Protect admin operations from automated abuse

### 4. General API (apiThrottle) - NEW
- **Limit**: 60 requests per minute per IP
- **Block Duration**: 5 minutes
- **Recommended For**: Most authenticated API endpoints
- **Endpoints**:
  - Campaign CRUD operations
  - Product management
  - Commission tracking
  - Affiliate operations
  - Profile updates

### 5. Tracking Endpoints (trackingThrottle) - NEW
- **Limit**: 1000 requests per minute per IP
- **Block Duration**: 1 minute
- **Applied To**:
  - `POST /api/clicks/track/:slug` - Affiliate click tracking
  - `POST /api/conversions/report` - Conversion reporting
  - `GET /affiliate-links/:id/metrics` - Link metrics
- **Rationale**: High-volume, legitimate traffic from tracking pixels

### 6. Webhook Endpoints (webhookThrottle) - NEW
- **Limit**: 200 requests per minute per IP
- **Block Duration**: 2 minutes
- **Applied To**:
  - `POST /api/payments/webhook/stripe`
  - `POST /api/payments/webhook/paystack`
  - `POST /api/payments/webhook/flutterwave`
  - `POST /api/payments/webhook/paypal`
- **Rationale**: Legitimate webhook delivery from payment providers

### 7. Campaign Discovery (campaignThrottle) - NEW
- **Limit**: 100 requests per hour per IP
- **Block Duration**: 30 minutes
- **Applied To**:
  - `GET /api/campaigns` - Campaign discovery/search
  - `GET /affiliate/campaigns/discover` - Campaign discovery page
- **Rationale**: Prevent scraping of campaign database

## Rate Limit Headers

All API responses include rate limit information:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1727989234
```

When rate limit is exceeded:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 300

{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 300 seconds.",
  "retryAfter": 300
}
```

## Implementation Details

### Configuration File
- **Location**: `start/limiter.ts`
- **Middleware Integration**: Uses AdonisJS built-in `@adonisjs/limiter`
- **Storage**: Tracks requests in-memory per process (or Redis for distributed deployments)

### Applying Rate Limiting to Routes

#### Example 1: Campaign Discovery Endpoint
```typescript
router.get('/campaigns', [controllers.Campaigns, 'discover']).use(campaignThrottle)
```

#### Example 2: Payment Webhook
```typescript
router.post('/payments/webhook/stripe', [controllers.Webhook, 'stripeWebhook']).use(webhookThrottle)
```

#### Example 3: Affiliate Click Tracking
```typescript
router.post('/clicks/track/:slug', [controllers.AffiliateLinks, 'trackClick']).use(trackingThrottle)
```

### Configuring Rate Limits

To modify rate limits, edit `start/limiter.ts`:

```typescript
// Example: Change API throttle to 100 requests per minute
export const apiThrottle = limiter.define('api', () => {
  return limiter.allowRequests(100).every('1 min').blockFor('5 mins')
})
```

## Best Practices

### For API Consumers
1. **Implement Exponential Backoff**: When receiving 429, retry with increasing delays
2. **Monitor Headers**: Check `X-RateLimit-Remaining` to avoid hitting limits
3. **Respect Retry-After**: Honor the `Retry-After` header for blocked requests
4. **Batch Operations**: Group multiple operations into single requests where possible
5. **Cache Results**: Cache API responses to reduce request frequency

### For Endpoint Designers
1. **Choose Appropriate Tier**: Select rate limit tier based on endpoint purpose
   - Sensitive (auth) → authThrottle
   - Account creation → signupThrottle
   - Bulk operations → apiThrottle
   - High-volume tracking → trackingThrottle
   - Webhooks → webhookThrottle
   - Discovery/search → campaignThrottle

2. **Document Limits**: Include rate limit info in API documentation
3. **Test Gracefully**: Test with rate limits to ensure proper error handling
4. **Monitor Usage**: Track rate limit violations to identify abuse patterns

## Monitoring & Analytics

### Key Metrics to Track
- Total requests blocked by tier
- Most frequently rate-limited IPs
- Rate limit violation trends
- Peak request times
- Endpoint-specific patterns

### Logging
Rate limit violations are logged with:
- IP address
- Endpoint
- Timestamp
- Limit tier applied
- Remaining quota

## Exemptions & Special Cases

### Whitelisted IPs
- Internal services (future)
- Partner integrations (future)
- Monitoring/health check endpoints (future)

To whitelist an IP (future implementation):
```typescript
const whitelistedIps = ['127.0.0.1', '192.168.1.1']
if (whitelistedIps.includes(clientIp)) {
  // Skip rate limiting
}
```

### Authenticated Users Premium Tiers
- Could implement higher limits for premium users
- Pro tier: 2x normal limits
- Enterprise: Custom limits

## Distributed Deployments

### Current Setup
- Per-process rate limiting
- Works for single-server deployments
- Each server tracks independently

### For Distributed Systems
To implement global rate limiting across multiple servers:
1. Use Redis-backed rate limiter (AdonisJS supports this)
2. Configure in `config/limiter.ts`
3. All servers share the same quota pool

Configuration example:
```typescript
// config/limiter.ts
import { defineConfig } from '@adonisjs/limiter'
import env from '#start/env'

export default defineConfig({
  default: 'redis',
  stores: {
    redis: {
      client: 'redis',
      // Redis connection config
    }
  }
})
```

## Testing Rate Limits

### Manual Testing
```bash
# Test login rate limit (10 per 15 mins)
for i in {1..15}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
  sleep 1
done

# Should see 429 after 10 attempts
```

### Automated Testing
```typescript
// Example test scenario
describe('Rate Limiting', () => {
  it('should block after exceeding auth limit', async () => {
    const requests = Array(12).fill().map(() => 
      client.post('/auth/login').json({
        email: 'test@example.com',
        password: 'test'
      })
    )
    
    const results = await Promise.all(requests)
    const blocked = results.filter(r => r.status === 429)
    
    assert.isGreater(blocked.length, 0)
  })
})
```

## Troubleshooting

### Issue: Getting rate limited for legitimate traffic
**Solutions**:
1. Implement request batching
2. Cache responses
3. Contact support for whitelist/higher limits
4. Use pagination for list endpoints

### Issue: Rate limit not working
**Check**:
1. Middleware is applied to route
2. Limiter service is configured
3. Redis is running (if using Redis backend)
4. Check server logs for errors

### Issue: Limits too strict
**Adjust**:
1. Modify request windows in `start/limiter.ts`
2. Increase allowed request count
3. Implement token bucket or sliding window for smoother limits

## Future Enhancements

1. **User-Based Limits**: Different limits per user tier
2. **Endpoint-Specific Tuning**: Fine-grained limits per endpoint
3. **Adaptive Limiting**: Automatically adjust limits based on load
4. **GraphQL Support**: Rate limiting for GraphQL queries
5. **Cost-Based Limiting**: Weight expensive operations higher
6. **Gradual Backoff**: Progressive wait times instead of hard blocks

## References

- [AdonisJS Limiter Documentation](https://docs.adonisjs.com/guides/basics/rate-limiter)
- [Rate Limiting Best Practices](https://www.cloudflare.com/learning/bbb/what-is-rate-limiting/)
- [HTTP 429 Status Code](https://httpwg.org/specs/rfc6585.html#status.429)
