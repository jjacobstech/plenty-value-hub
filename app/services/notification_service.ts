import User from '#models/user'
import type Order from '#models/order'
import type Product from '#models/product'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export class NotificationService {
  /**
   * Send comprehensive notifications to Admin, Vendor, Affiliate, and Buyer when an order completes.
   */
  static async notifyOrderCompleted(order: Order, product: Product) {
    const serializedOrder = order.serialize()
    const serializedProduct = product.serialize()

    const vendor = order.vendorId ? await User.find(order.vendorId) : null
    const isManualPayment = String(order.paymentMethod || '').toLowerCase() === 'manual'
    const manualInstructions =
      isManualPayment && vendor
        ? {
            payoutMethod: vendor.payoutMethod || 'manual',
            payoutDetails: vendor.payoutDetails || 'Bank transfer details not set yet.',
          }
        : null

    // 1. Notify Buyer
    if (order.buyerEmail) {
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
            })
        })
      } catch (err) {
        console.error(`[NotificationService] Failed to notify buyer (${order.buyerEmail}):`, err)
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
            .subject(`[Admin Alert] New Order #${order.orderNumber} — $${order.amount}`)
            .htmlView('emails/admin_order_notification', {
              order: serializedOrder,
              product: serializedProduct,
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
          await mail.send((message) => {
            message
              .to(vendor.email)
              .subject(`🎉 You made a sale! Order #${order.orderNumber} (${product.name})`)
              .htmlView('emails/vendor_order_notification', {
                order: serializedOrder,
                product: serializedProduct,
              })
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
              })
          })
        }
      }
    } catch (err) {
      console.error('[NotificationService] Failed to notify affiliate:', err)
    }
  }
}
