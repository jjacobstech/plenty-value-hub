import limiter from '@adonisjs/limiter/services/main'

/**
 * 10 attempts per 15 minutes per IP — applied to login, OTP, and password reset routes.
 * Block for an extra 10 minutes after exhausting all attempts.
 */
export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(10).every('15 mins').blockFor('10 mins')
})

/**
 * 5 attempts per hour per IP — applied to signup step routes to slow account creation.
 */
export const signupThrottle = limiter.define('signup', () => {
  return limiter.allowRequests(5).every('1 hour')
})

/**
 * 100 requests per minute per IP — applied to admin API endpoints.
 */
export const adminThrottle = limiter.define('admin', () => {
  return limiter.allowRequests(100).every('1 min')
})

/**
 * 60 requests per minute per IP — general API rate limit for authenticated users.
 */
export const apiThrottle = limiter.define('api', () => {
  return limiter.allowRequests(60).every('1 min').blockFor('5 mins')
})

/**
 * 1000 requests per minute per IP — for high-volume affiliate tracking endpoints.
 */
export const trackingThrottle = limiter.define('tracking', () => {
  return limiter.allowRequests(1000).every('1 min').blockFor('1 min')
})

/**
 * 200 requests per minute per IP — for webhook endpoints.
 */
export const webhookThrottle = limiter.define('webhook', () => {
  return limiter.allowRequests(200).every('1 min').blockFor('2 mins')
})

/**
 * 100 requests per hour per IP — for campaign discovery and listing endpoints.
 */
export const campaignThrottle = limiter.define('campaign', () => {
  return limiter.allowRequests(100).every('1 hour').blockFor('30 mins')
})
