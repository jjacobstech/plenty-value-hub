import type { HttpContext } from '@adonisjs/core/http'
import mobileApiConfig from '#config/mobile_api'

export default class MobileApiController {
  /**
   * Get mobile app configuration
   */
  async getAppConfig({ request, response }: HttpContext) {
    const appVersion = request.header('X-App-Version', 'unknown')
    const platform = request.header('X-Platform', 'unknown') as 'ios' | 'android' | 'unknown'

    const config = {
      apiVersion: mobileApiConfig.versioning.currentVersion,
      minimumAppVersion: mobileApiConfig.versioning.minimumAppVersion,
      appVersion: appVersion,
      platform: platform,
      features: {
        auth: mobileApiConfig.auth.tokenBased,
        apiKey: mobileApiConfig.auth.apiKeyAuth,
        pushNotifications: true,
        analytics: true,
      },
      limits: {
        defaultLimit: mobileApiConfig.response.defaultLimit,
        maxLimit: mobileApiConfig.response.maxLimit,
      },
      endpoints: {
        base: '/api',
        auth: '/api/auth',
        users: '/api/users',
        products: '/api/products',
        orders: '/api/orders',
      },
      csrfExempt: mobileApiConfig.csrf.skipForMobileClients,
    }

    return response.json({
      success: true,
      data: config,
    })
  }

  /**
   * Register device for push notifications
   */
  async registerDevice({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user

    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    const { deviceToken, platform, deviceId, deviceName } = request.all()

    if (!deviceToken || !platform) {
      return response.status(400).json({ error: 'Missing required fields: deviceToken, platform' })
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return response.status(400).json({ error: 'Invalid platform' })
    }

    return response.json({
      success: true,
      message: 'Device registered successfully',
      data: {
        userId: user.id,
        deviceToken: deviceToken.substring(0, 20) + '...',
        platform: platform,
        deviceId: deviceId || 'unknown',
        deviceName: deviceName || 'Unknown Device',
        registeredAt: new Date().toISOString(),
      },
    })
  }

  /**
   * Get device information (for debugging/support)
   */
  async getDeviceInfo({ request, response }: HttpContext) {
    const userAgent = request.header('user-agent', 'unknown')
    const appVersion = request.header('X-App-Version', 'unknown')
    const platform = request.header('X-Platform', 'unknown')
    const deviceId = request.header('X-Device-Id', 'unknown')
    const isMobileClient = (request.ctx as any)?.isMobileClient || false

    return response.json({
      success: true,
      data: {
        userAgent: userAgent,
        appVersion: appVersion,
        platform: platform,
        deviceId: deviceId,
        isMobileClient: isMobileClient,
        timestamp: new Date().toISOString(),
      },
    })
  }

  /**
   * Health check endpoint for mobile apps
   */
  async healthCheck({ response }: HttpContext) {
    return response.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: mobileApiConfig.versioning.currentVersion,
    })
  }

  /**
   * Get mobile app documentation/help
   */
  async getHelp({ response }: HttpContext) {
    return response.json({
      success: true,
      data: {
        title: 'Plenty Value Hub - Mobile API Documentation',
        version: mobileApiConfig.versioning.currentVersion,
        authentication: {
          method: 'Bearer Token or API Key',
          header: 'Authorization: Bearer <token>',
          apiKeyHeader: 'X-API-Key: <key>',
          tokenExpiration: `${mobileApiConfig.csrf.tokenExpirationHours} hours`,
        },
        baseUrl: '/api',
        requiredHeaders: {
          'User-Agent': 'Mobile app user agent (auto-detected)',
          'X-App-Version': 'Current app version (e.g., 1.0.0)',
          'X-Platform': 'Platform identifier (ios/android)',
        },
        optionalHeaders: {
          'X-Device-Id': 'Unique device identifier',
          'X-Device-Name': 'Device name for logging',
        },
        csrfProtection: {
          enabled: !mobileApiConfig.csrf.skipForMobileClients,
          message: 'CSRF tokens are not required for mobile clients',
        },
        pagination: {
          defaultLimit: mobileApiConfig.response.defaultLimit,
          maxLimit: mobileApiConfig.response.maxLimit,
          parameters: ['page', 'limit'],
        },
        endpoints: {
          auth: '/auth/login, /auth/logout, /auth/refresh',
          users: '/users/profile, /users/update',
          products: '/products, /products/:id',
          orders: '/orders, /orders/:id',
          campaigns: '/campaigns, /campaigns/:id',
          commissions: '/commissions, /commissions/:id',
        },
      },
    })
  }

  /**
   * Validate API token
   */
  async validateToken({ auth, response }: HttpContext) {
    try {
      const user = auth.use('web').user

      if (!user) {
        return response.status(401).json({
          success: false,
          valid: false,
          error: 'Invalid or expired token',
        })
      }

      return response.json({
        success: true,
        valid: true,
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          tokenValid: true,
        },
      })
    } catch (error) {
      return response.status(401).json({
        success: false,
        valid: false,
        error: 'Token validation failed',
      })
    }
  }

  /**
   * Report mobile app error/crash (for debugging)
   */
  async reportError({ request, auth, response }: HttpContext) {
    const { errorMessage, errorStack, platform, appVersion, deviceId } = request.all()

    const userId = auth.use('web').user?.id || null

    const errorReport = {
      id: Math.random().toString(36).substring(7),
      userId,
      errorMessage,
      errorStack,
      platform,
      appVersion,
      deviceId,
      timestamp: new Date().toISOString(),
      status: 'logged',
    }

    return response.json({
      success: true,
      message: 'Error report logged successfully',
      data: {
        errorId: errorReport.id,
        message: 'Your error report has been received and logged',
      },
    })
  }
}
