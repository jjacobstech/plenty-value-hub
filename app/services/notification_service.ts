import User from '#models/user'
import Notification from '#models/notification'
import type Order from '#models/order'
import type Product from '#models/product'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', NGN: '₦', EUR: '€', GBP: '£',
  KES: 'KSh', GHS: 'GH₵', CAD: 'CA$', AUD: 'A$',
}

/**
 * Resolves the platform currency symbol from site_settings (payment_settings key).
 * Falls back to '$' if not configured.
 */
async function getCurrencySymbol(): Promise<string> {
  try {
    const { PaymentService } = await import('#services/payment_service')
    const config = await PaymentService.getConfig()
    return config.currencySymbol || CURRENCY_SYMBOLS[config.currency] || '$'
  } catch {
    return '$'
  }
}

export class NotificationService {
  /**
   * Send comprehensive notifications to Admin, Vendor, Affiliate, and Buyer when an order completes.
   */
  static async notifyOrderCompleted(order: Order, product: Product) {
    const serializedOrder = order.serialize()
    const serializedProduct = product.serialize()
    const currencySymbol = await getCurrencySymbol()

    const vendor = order.vendorId ? await User.find(order.vendorId) : null
    const isManualPayment = String(order.paymentMethod || '').toLowerCase() === 'manual'
    const manualInstructions =
      isManualPayment && vendor
        ? {
            payoutMethod: vendor.payoutMethod || 'manual',
            payoutDetails: vendor.payoutDetails || 'Bank transfer details not set yet.',
          }
        : null

    // Parse shipping details if available
    let shippingDetails: any = null
    if (order.shippingDetails) {
      try {
        shippingDetails =
          typeof order.shippingDetails === 'string'
            ? JSON.parse(order.shippingDetails)
            : order.shippingDetails
      } catch (err) {
        console.error('[NotificationService] Failed to parse shipping details:', err)
      }
    }

    // 1. Notify Buyer
    if (order.buyerEmail) {
      const appUrl = env.get('APP_URL') || 'http://localhost:3000'
      const trackOrderUrl = `${appUrl}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.buyerEmail)}`

      // Only include the download link if the product is digital and payment is fully settled
      const digitalAsset =
        product.productType === 'digital' &&
          product.digitalAssetUrl &&
          order.status === 'completed'
          ? {
            url: product.digitalAssetUrl,
            name: product.digitalAssetName || product.name || 'Digital Asset',
          }
          : null

      console.log(`[NotificationService] Buyer email for order ${order.orderNumber}: productType=${product.productType}, status=${order.status}, hasDigitalUrl=${!!product.digitalAssetUrl}, digitalAsset=${!!digitalAsset}`)

      try {
        await mail.send((message) => {
          message
            .to(order.buyerEmail!)
            .subject(`Order #${order.orderNumber} Confirmed — Plenty Value`)
            .htmlView('emails/order_confirmation', {
              order: serializedOrder,
              product: serializedProduct,
              vendor,
              manualInstructions,
              isManualPayment,
              digitalAsset,
              trackOrderUrl,
              currencySymbol,
            })
        })
        console.log(`[NotificationService] Buyer confirmation sent to ${order.buyerEmail} (order ${order.orderNumber}) - Digital asset included: ${!!digitalAsset}`)
      } catch (err: any) {
        console.error(
          `[NotificationService] FAILED to send buyer confirmation to ${order.buyerEmail} (order ${order.orderNumber}):`,
          err?.message || err
        )
      }
    } else {
      console.warn(`[NotificationService] No buyerEmail on order ${order.orderNumber} — skipping buyer notification`)
    }

    // 2. Notify Admin(s)
    try {
      const adminUsers = await User.query().where('role', 'admin')
      const adminEmails = adminUsers.map((u) => u.email).filter(Boolean)
      const fallbackAdmin = env.get('MAIL_FROM_ADDRESS') || 'admin@plentyvalue.com'
      const recipients = adminEmails.length > 0 ? adminEmails : [fallbackAdmin]

      for (const email of recipients) {
        await mail.send((message) => {
          message
            .to(email)
            .subject(`[Admin Alert] New Order #${order.orderNumber} — $${order.amount}`)
            .htmlView('emails/admin_order_notification', {
              order: serializedOrder,
              product: serializedProduct,
              currencySymbol,
            })
        })
      }
    } catch (err) {
      console.error('[NotificationService] Failed to notify admin:', err)
    }

    // 3. Notify Vendor
    try {
      const vendorId = order.vendorId || product.vendorId
      if (vendorId) {
        const vendor = await User.find(vendorId)
        if (vendor && vendor.email) {
          // Send email notification
          await mail.send((message) => {
            message
              .to(vendor.email)
              .subject(`🎉 You made a sale! Order #${order.orderNumber} (${product.name})`)
              .htmlView('emails/vendor_order_notification', {
                order: serializedOrder,
                product: serializedProduct,
                shippingDetails,
                currencySymbol,
              })
          })

          // Create in-app notification
          await Notification.createNotification({
            userId: vendorId,
            type: 'sale',
            title: `New Sale: ${product.name}`,
            message: `You made a sale! Order #${order.orderNumber} for $${order.vendorPayout}`,
            icon: '🎉',
            data: {
              orderId: order.id,
              productId: product.id,
              amount: order.vendorPayout,
            },
            actionUrl: `/vendor/orders/${order.id}`,
          })
        }
      }
    } catch (err) {
      console.error('[NotificationService] Failed to notify vendor:', err)
    }

    // 4. Notify Affiliate (if order came via affiliate referral)
    try {
      if (order.affiliateId && Number.parseFloat(order.commissionAmount || '0') > 0) {
        const affiliate = await User.find(order.affiliateId)
        if (affiliate && affiliate.email) {
          await mail.send((message) => {
            message
              .to(affiliate.email)
              .subject(`💰 Commission Earned! Order #${order.orderNumber}`)
              .htmlView('emails/affiliate_commission_notification', {
                order: serializedOrder,
                product: serializedProduct,
                currencySymbol,
              })
          })
        }
      }
    } catch (err) {
      console.error('[NotificationService] Failed to notify affiliate:', err)
    }
  }

  /**
   * Send notifications for physical products in processing status
   * Notifies buyer, admin and vendor about order processing
   */
  static async notifyOrderProcessing(order: Order, product: Product) {
    const serializedOrder = order.serialize()
    const serializedProduct = product.serialize()
    const currencySymbol = await getCurrencySymbol()

    const vendor = order.vendorId ? await User.find(order.vendorId) : null

    // Parse shipping details if available
    let shippingDetails: any = null
    if (order.shippingDetails) {
      try {
        shippingDetails =
          typeof order.shippingDetails === 'string'
            ? JSON.parse(order.shippingDetails)
            : order.shippingDetails
      } catch (err) {
        console.error('[NotificationService] Failed to parse shipping details:', err)
      }
    }

    // 1. Notify Buyer (processing status)
    if (order.buyerEmail) {
      const appUrl = env.get('APP_URL') || 'http://localhost:3000'
      const trackOrderUrl = `${appUrl}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.buyerEmail)}`

      try {
        await mail.send((message) => {
          message
            .to(order.buyerEmail!)
            .subject(`Order #${order.orderNumber} Received - Processing Started — Plenty Value`)
            .htmlView('emails/order_processing', {
              order: serializedOrder,
              product: serializedProduct,
              vendor,
              shippingDetails,
              trackOrderUrl,
              currencySymbol,
            })
        })
        console.log(`[NotificationService] Processing notification sent to buyer ${order.buyerEmail} (order ${order.orderNumber})`)
      } catch (err: any) {
        console.error(
          `[NotificationService] FAILED to send processing notification to ${order.buyerEmail} (order ${order.orderNumber}):`,
          err?.message || err
        )
      }
    }

    // 2. Notify Admin(s)
    try {
      const adminUsers = await User.query().where('role', 'admin')
      const adminEmails = adminUsers.map((u) => u.email).filter(Boolean)
      const fallbackAdmin = env.get('MAIL_FROM_ADDRESS') || 'admin@plentyvalue.com'
      const recipients = adminEmails.length > 0 ? adminEmails : [fallbackAdmin]

      for (const email of recipients) {
        await mail.send((message) => {
          message
            .to(email)
            .subject(`[Admin Alert] New Order (Processing) #${order.orderNumber} — $${order.amount}`)
            .htmlView('emails/admin_order_notification', {
              order: serializedOrder,
              product: serializedProduct,
              currencySymbol,
            })
        })
      }
    } catch (err) {
      console.error('[NotificationService] Failed to notify admin about processing order:', err)
    }

    // 3. Notify Vendor
    try {
      const vendorId = order.vendorId || product.vendorId
      if (vendorId) {
        const vendor = await User.find(vendorId)
        if (vendor && vendor.email) {
          // Send email notification
          await mail.send((message) => {
            message
              .to(vendor.email)
              .subject(`📦 New Order to Fulfill! Order #${order.orderNumber} (${product.name})`)
              .htmlView('emails/vendor_order_notification', {
                order: serializedOrder,
                product: serializedProduct,
                shippingDetails,
                currencySymbol,
              })
          })

          // Create in-app notification
          await Notification.createNotification({
            userId: vendorId,
            type: 'order_processing',
            title: `New Order to Ship: ${product.name}`,
            message: `You have a new order to fulfill! Order #${order.orderNumber} - Please prepare for shipping.`,
            icon: '📦',
            data: {
              orderId: order.id,
              productId: product.id,
              amount: order.vendorPayout,
            },
            actionUrl: `/vendor/orders/${order.id}`,
          })
        }
      }
    } catch (err) {
      console.error('[NotificationService] Failed to notify vendor about processing order:', err)
    }

    console.log(`[NotificationService] Processing notifications sent for order ${order.orderNumber} (physical product)`)
  }
}
