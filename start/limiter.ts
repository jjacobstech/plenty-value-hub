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
