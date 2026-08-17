import type { HttpContext } from '@adonisjs/core/http'
import { PaymentGatewayService } from '#services/payment_gateway_service'
import PaymentGatewayKey from '#models/payment_gateway_key'

/**
 * PaymentSettingsController
 *
 * Admin endpoints for managing payment gateway configurations
 * Requires admin role
 */
export default class PaymentSettingsController {
  /**
   * Get all payment gateway configurations
   * GET /api/admin/payment-settings
   */
  async index({ response, auth }: HttpContext) {
    try {
      const user = auth.use('web').user!

      if (user.role !== 'admin') {
        return response.status(403).json({ error: 'Only admins can access payment settings' })
      }

      const gateways = await PaymentGatewayKey.query()
      const formatted = gateways.map((gw) => ({
        id: gw.id,
        gateway: gw.gateway,
        isActive: gw.isActive,
        merchantId: gw.merchantId,
        hasPublicKey: !!gw.publicKey,
        hasSecretKey: !!gw.secretKey,
        hasWebhookSecret: !!gw.webhookSecret,
        createdAt: gw.createdAt,
        updatedAt: gw.updatedAt,
      }))

      return response.json({
        success: true,
        data: formatted,
      })
    } catch (err) {
      console.error('[PaymentSettingsController.index] Error:', err)
      return response.status(500).json({
        success: false,
        error: 'Failed to retrieve payment settings',
      })
    }
  }

  /**
   * Get single gateway configuration
   * GET /api/admin/payment-settings/:gateway
   */
  async show({ params, response, auth }: HttpContext) {
    try {
      const user = auth.use('web').user!

      if (user.role !== 'admin') {
        return response.status(403).json({ error: 'Only admins can access payment settings' })
      }

      const gatewayKey = await PaymentGatewayKey.findByGateway(params.gateway)

      if (!gatewayKey) {
        return response.status(404).json({
          success: false,
          error: `Gateway '${params.gateway}' not configured`,
        })
      }

      return response.json({
        success: true,
        data: {
          id: gatewayKey.id,
          gateway: gatewayKey.gateway,
          isActive: gatewayKey.isActive,
          merchantId: gatewayKey.merchantId,
          // Don't return actual keys, just indicate they exist
          hasPublicKey: !!gatewayKey.publicKey,
          hasSecretKey: !!gatewayKey.secretKey,
          hasWebhookSecret: !!gatewayKey.webhookSecret,
          createdAt: gatewayKey.createdAt,
          updatedAt: gatewayKey.updatedAt,
        },
      })
    } catch (err) {
      console.error('[PaymentSettingsController.show] Error:', err)
      return response.status(500).json({
        success: false,
        error: 'Failed to retrieve payment settings',
      })
    }
  }

  /**
   * Create or update gateway configuration
   * POST /api/admin/payment-settings
   *
   * Body:
   * {
   *   "gateway": "paystack|flutterwave|stripe|paypal",
   *   "publicKey": "pk_live_xxx",
   *   "secretKey": "sk_live_xxx",
   *   "merchantId": "optional",
   *   "webhookSecret": "optional",
   *   "isActive": true
   * }
   */
  async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.use('web').user!

      if (user.role !== 'admin') {
        return response.status(403).json({ error: 'Only admins can access payment settings' })
      }

      const { gateway, publicKey, secretKey, merchantId, webhookSecret, isActive } = request.only([
        'gateway',
        'publicKey',
        'secretKey',
        'merchantId',
        'webhookSecret',
        'isActive',
      ])

      // Built-in manual provider does not require gateway credentials.
      if (gateway !== 'manual' && (!gateway || !publicKey || !secretKey)) {
        return response.status(400).json({
          success: false,
          error: 'gateway, publicKey, and secretKey are required',
        })
      }

      // Update or create
      const updated = await PaymentGatewayService.updateConfig(
        gateway,
        publicKey,
        secretKey,
        merchantId,
        webhookSecret,
        isActive ?? true
      )

      return response.json({
        success: true,
        message: `Payment settings for ${gateway} updated successfully`,
        data: {
          id: updated.id,
          gateway: updated.gateway,
          isActive: updated.isActive,
          merchantId: updated.merchantId,
          hasPublicKey: !!updated.publicKey,
          hasSecretKey: !!updated.secretKey,
          hasWebhookSecret: !!updated.webhookSecret,
        },
      })
    } catch (err) {
      console.error('[PaymentSettingsController.store] Error:', err)
      return response.status(500).json({
        success: false,
        error: 'Failed to update payment settings',
      })
    }
  }

  /**
   * Update gateway configuration (PUT - for updates only)
   * PUT /api/admin/payment-settings/:gateway
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.use('web').user!

      if (user.role !== 'admin') {
        return response.status(403).json({ error: 'Only admins can access payment settings' })
      }

      const gatewayKey = await PaymentGatewayKey.findByGateway(params.gateway)

      if (!gatewayKey) {
        return response.status(404).json({
          success: false,
          error: `Gateway '${params.gateway}' not configured`,
        })
      }

      const { publicKey, secretKey, merchantId, webhookSecret, isActive } = request.only([
        'publicKey',
        'secretKey',
        'merchantId',
        'webhookSecret',
        'isActive',
      ])

      // Update only provided fields. Manual is a built-in provider and does not require keys.
      if (params.gateway !== 'manual' && publicKey) gatewayKey.publicKey = publicKey
      if (params.gateway !== 'manual' && secretKey) gatewayKey.secretKey = secretKey
      if (merchantId !== undefined) gatewayKey.merchantId = merchantId
      if (webhookSecret !== undefined) gatewayKey.webhookSecret = webhookSecret
      if (isActive !== undefined) gatewayKey.isActive = isActive

      await gatewayKey.save()
      await PaymentGatewayService.clearCache(params.gateway)

      return response.json({
        success: true,
        message: `Payment settings for ${params.gateway} updated successfully`,
        data: {
          id: gatewayKey.id,
          gateway: gatewayKey.gateway,
          isActive: gatewayKey.isActive,
          merchantId: gatewayKey.merchantId,
          hasPublicKey: !!gatewayKey.publicKey,
          hasSecretKey: !!gatewayKey.secretKey,
          hasWebhookSecret: !!gatewayKey.webhookSecret,
        },
      })
    } catch (err) {
      console.error('[PaymentSettingsController.update] Error:', err)
      return response.status(500).json({
        success: false,
        error: 'Failed to update payment settings',
      })
    }
  }

  /**
   * Toggle gateway active status
   * PATCH /api/admin/payment-settings/:gateway/toggle
   */
  async toggle({ params, response, auth }: HttpContext) {
    try {
      const user = auth.use('web').user!

      if (user.role !== 'admin') {
        return response.status(403).json({ error: 'Only admins can access payment settings' })
      }

      const newStatus = await PaymentGatewayService.toggleGateway(params.gateway)

      return response.json({
        success: true,
        message: `${params.gateway} is now ${newStatus ? 'active' : 'inactive'}`,
        data: {
          gateway: params.gateway,
          isActive: newStatus,
        },
      })
    } catch (err: any) {
      console.error('[PaymentSettingsController.toggle] Error:', err)
      return response.status(500).json({
        success: false,
        error: err.message || 'Failed to toggle gateway status',
      })
    }
  }

  /**
   * Delete gateway configuration
   * DELETE /api/admin/payment-settings/:gateway
   */
  async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.use('web').user!

      if (user.role !== 'admin') {
        return response.status(403).json({ error: 'Only admins can access payment settings' })
      }

      const gatewayKey = await PaymentGatewayKey.findByGateway(params.gateway)

      if (!gatewayKey) {
        return response.status(404).json({
          success: false,
          error: `Gateway '${params.gateway}' not configured`,
        })
      }

      await gatewayKey.delete()
      await PaymentGatewayService.clearCache(params.gateway)

      return response.json({
        success: true,
        message: `Payment settings for ${params.gateway} deleted successfully`,
      })
    } catch (err) {
      console.error('[PaymentSettingsController.destroy] Error:', err)
      return response.status(500).json({
        success: false,
        error: 'Failed to delete payment settings',
      })
    }
  }

  /**
   * Get list of configured gateways (for UI)
   * GET /api/admin/payment-settings/status/list
   */
  async statusList({ response, auth }: HttpContext) {
    try {
      const user = auth.use('web').user!

      if (user.role !== 'admin') {
        return response.status(403).json({ error: 'Only admins can access payment settings' })
      }

      const configured = await PaymentGatewayService.getConfiguredGateways()

      return response.json({
        success: true,
        data: configured,
      })
    } catch (err) {
      console.error('[PaymentSettingsController.statusList] Error:', err)
      return response.status(500).json({
        success: false,
        error: 'Failed to retrieve gateway status',
      })
    }
  }
}
