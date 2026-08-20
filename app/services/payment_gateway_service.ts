import PaymentGatewayKey from '#models/payment_gateway_key'

/**
 * PaymentGatewayService
 *
 * Manages payment gateway configuration retrieval and caching
 * Retrieves encrypted keys from database and decrypts them for use
 * Uses simple in-memory caching to minimize database queries
 *
 * Usage:
 * ```typescript
 * const paystackConfig = await PaymentGatewayService.getConfig('paystack')
 * const stripeConfig = await PaymentGatewayService.getConfig('stripe')
 * ```
 */
export class PaymentGatewayService {
  private static readonly CACHE_KEY_PREFIX = 'payment_gateway:'
  private static readonly CACHE_TTL = 3600 // 1 hour
  private static cache: Map<string, { data: any; expiresAt: number }> = new Map()

  /**
   * Get gateway configuration from database (with caching)
   */
  static async getConfig(gateway: string) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${gateway}`

    try {
      // Try to get from cache first
      const cached = this.cache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        console.log(`[PaymentGatewayService] Retrieved ${gateway} config from cache`)
        return cached.data
      }

      // Cache expired or doesn't exist, remove it
      if (cached) {
        this.cache.delete(cacheKey)
      }

      // Get from database
      const gatewayKey = await PaymentGatewayKey.findByGateway(gateway)
      if (!gatewayKey) {
        console.warn(`[PaymentGatewayService] No configuration found for gateway: ${gateway}`)
        return null
      }

      if (!gatewayKey.isActive) {
        console.warn(`[PaymentGatewayService] Gateway ${gateway} is not active`)
        return null
      }

      // Get decrypted configuration
      const config = gatewayKey.getConfig()

      // Cache it
      this.cache.set(cacheKey, {
        data: config,
        expiresAt: Date.now() + this.CACHE_TTL * 1000,
      })
      console.log(`[PaymentGatewayService] Cached ${gateway} config for ${this.CACHE_TTL}s`)

      return config
    } catch (err) {
      console.error(`[PaymentGatewayService] Error retrieving ${gateway} config:`, err)
      return null
    }
  }

  /**
   * Get all active gateway configurations
   */
  static async getAllConfigs() {
    const cacheKey = `${this.CACHE_KEY_PREFIX}all`

    try {
      // Try cache first
      const cached = this.cache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        console.log('[PaymentGatewayService] Retrieved all configs from cache')
        return cached.data
      }

      // Cache expired or doesn't exist, remove it
      if (cached) {
        this.cache.delete(cacheKey)
      }

      // Get from database
      const gateways = await PaymentGatewayKey.getActiveGateways()
      const configs = gateways.map((gw) => gw.getConfig())

      // Cache it
      this.cache.set(cacheKey, {
        data: configs,
        expiresAt: Date.now() + this.CACHE_TTL * 1000,
      })
      console.log(`[PaymentGatewayService] Cached all configs for ${this.CACHE_TTL}s`)

      return configs
    } catch (err) {
      console.error('[PaymentGatewayService] Error retrieving all configs:', err)
      return []
    }
  }

  /**
   * Get specific credential for a gateway
   */
  static async getCredential(
    gateway: string,
    credentialType:
      | 'publicKey'
      | 'secretKey'
      | 'webhookSecret'
      | 'merchantId'
      | 'clientId'
      | 'clientSecret'
  ) {
    try {
      const gatewayKey = await PaymentGatewayKey.findByGateway(gateway)
      if (!gatewayKey) {
        return null
      }

      switch (credentialType) {
        case 'publicKey':
        case 'clientId':
          return gatewayKey.publicKey
        case 'secretKey':
        case 'clientSecret':
          return gatewayKey.secretKey
        case 'webhookSecret':
          return gatewayKey.webhookSecret
        case 'merchantId':
          return gatewayKey.merchantId
        default:
          return null
      }
    } catch (err) {
      console.error(
        `[PaymentGatewayService] Error retrieving ${credentialType} for ${gateway}:`,
        err
      )
      return null
    }
  }

  /**
   * Update gateway configuration
   */
  static async updateConfig(
    gateway: string,
    publicKey: string,
    secretKey: string,
    merchantId?: string,
    webhookSecret?: string,
    isActive?: boolean
  ) {
    try {
      let gatewayKey = await PaymentGatewayKey.findByGateway(gateway)

      if (!gatewayKey) {
        // Create new gateway configuration
        gatewayKey = new PaymentGatewayKey()
        gatewayKey.gateway = gateway
      }

      // Update credentials
      await gatewayKey.updateCredentials(publicKey, secretKey, webhookSecret, merchantId)

      // Update active status if provided
      if (isActive !== undefined) {
        gatewayKey.isActive = isActive
        await gatewayKey.save()
      }

      // Clear cache
      await this.clearCache(gateway)

      console.log(`[PaymentGatewayService] Updated configuration for ${gateway}`)
      return gatewayKey
    } catch (err) {
      console.error(`[PaymentGatewayService] Error updating ${gateway} config:`, err)
      throw err
    }
  }

  /**
   * Toggle gateway active status
   */
  static async toggleGateway(gateway: string) {
    try {
      const gatewayKey = await PaymentGatewayKey.findByGateway(gateway)
      if (!gatewayKey) {
        throw new Error(`Gateway ${gateway} not found`)
      }

      const newStatus = await gatewayKey.toggleActive()
      await this.clearCache(gateway)

      console.log(`[PaymentGatewayService] Toggled ${gateway} active status to: ${newStatus}`)
      return newStatus
    } catch (err) {
      console.error(`[PaymentGatewayService] Error toggling ${gateway}:`, err)
      throw err
    }
  }

  /**
   * Clear cache for a specific gateway
   */
  static async clearCache(gateway?: string) {
    try {
      if (gateway) {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${gateway}`
        this.cache.delete(cacheKey)
        console.log(`[PaymentGatewayService] Cleared cache for ${gateway}`)
      } else {
        // Clear all gateway caches
        const allKey = `${this.CACHE_KEY_PREFIX}all`
        this.cache.delete(allKey)
        // Also clear individual gateway caches
        for (const key of this.cache.keys()) {
          if (key.startsWith(this.CACHE_KEY_PREFIX)) {
            this.cache.delete(key)
          }
        }
        console.log('[PaymentGatewayService] Cleared all gateway caches')
      }
    } catch (err) {
      console.error('[PaymentGatewayService] Error clearing cache:', err)
    }
  }

  /**
   * Check if a gateway is configured
   */
  static async isConfigured(gateway: string): Promise<boolean> {
    try {
      const gatewayKey = await PaymentGatewayKey.findByGateway(gateway)
      return !!gatewayKey && gatewayKey.isActive
    } catch (err) {
      console.error(`[PaymentGatewayService] Error checking if ${gateway} is configured:`, err)
      return false
    }
  }

  /**
   * Get list of all configured gateways
   */
  static async getConfiguredGateways() {
    try {
      const gateways = await PaymentGatewayKey.query()
      return gateways.map((gw) => ({
        gateway: gw.gateway,
        isActive: gw.isActive,
        hasCredentials: !!gw.publicKey && !!gw.secretKey,
      }))
    } catch (err) {
      console.error('[PaymentGatewayService] Error getting configured gateways:', err)
      return []
    }
  }
}
