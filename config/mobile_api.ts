const mobileApiConfig = {
  /**
   * Enable mobile API detection and exemptions
   */
  enabled: true,

  /**
   * Mobile client detection settings
   */
  detection: {
    /**
     * Automatically detect mobile user agents
     */
    autoDetect: true,

    /**
     * Mobile user agent patterns (case-insensitive regex)
     */
    userAgentPatterns: [
      'android',
      'webos',
      'iphone',
      'ipad',
      'ipod',
      'blackberry',
      'windows phone',
      'mobile',
      'expo',
      'react native',
      'flutter',
    ],
  },

  /**
   * CSRF token handling for mobile clients
   */
  csrf: {
    /**
     * Skip CSRF token validation for mobile clients
     * Mobile apps handle security differently (token-based auth, CORS, etc.)
     */
    skipForMobileClients: true,

    /**
     * Use token-based authentication for mobile (instead of session cookies)
     */
    useTokenAuth: true,

    /**
     * Token expiration in hours
     */
    tokenExpirationHours: 24,
  },

  /**
   * Mobile-specific response settings
   */
  response: {
    /**
     * Compress responses for mobile clients
     */
    compress: true,

    /**
     * Include pagination in list endpoints
     */
    includePagination: true,

    /**
     * Include metadata in responses
     */
    includeMetadata: true,

    /**
     * Limit results per page for mobile
     */
    defaultLimit: 20,
    maxLimit: 100,
  },

  /**
   * Mobile app authentication
   */
  auth: {
    /**
     * Allow token-based authentication
     */
    tokenBased: true,

    /**
     * Token header name
     */
    tokenHeader: 'Authorization',

    /**
     * Token prefix (e.g., "Bearer")
     */
    tokenPrefix: 'Bearer',

    /**
     * Allow API key authentication for mobile apps
     */
    apiKeyAuth: true,

    /**
     * API key header name
     */
    apiKeyHeader: 'X-API-Key',
  },

  /**
   * Mobile app versioning
   */
  versioning: {
    /**
     * Current mobile API version
     */
    currentVersion: '1.0.0',

    /**
     * Minimum supported mobile app version
     */
    minimumAppVersion: '1.0.0',

    /**
     * Version header name
     */
    versionHeader: 'X-App-Version',

    /**
     * Check app version on each request
     */
    enforceMinimumVersion: true,
  },

  /**
   * Mobile-specific endpoints
   */
  endpoints: {
    /**
     * Reuse existing API endpoints for mobile
     * Mobile clients use standard API endpoints with same authentication
     */
    reuseExisting: true,

    /**
     * Include platform-specific endpoints
     */
    platformSpecific: {
      ios: true,
      android: true,
    },

    /**
     * Mobile device info endpoint
     */
    deviceInfo: '/api/mobile/device-info',

    /**
     * Mobile app config endpoint
     */
    appConfig: '/api/mobile/config',

    /**
     * Mobile push notification setup
     */
    pushNotifications: '/api/mobile/push',
  },

  /**
   * Logging and monitoring for mobile clients
   */
  logging: {
    /**
     * Log mobile API requests
     */
    enabled: true,

    /**
     * Log level
     */
    level: 'info',

    /**
     * Track mobile-specific metrics
     */
    trackMetrics: true,
  },
}

export default mobileApiConfig
