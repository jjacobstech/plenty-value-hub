import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import AffiliateLink from '#models/affiliate_link'
import Review from '#models/review'
import Order from '#models/order'

export default class ApiController {
  // Newsletter subscription
  async subscribeNewsletter({ request, response }: HttpContext) {
    try {
      const { email, source } = request.only(['email', 'source'])

      const subscriber = await NewsletterSubscriber.create({
        email,
        source: source || 'app',
      })

      return response.ok({ success: true, subscriber })
    } catch (error) {
      return response.badRequest({ success: false, error: (error as Error).message })
    }
  }

  // Create review
  async createReview({ request, response }: HttpContext) {
    try {
      const { productId, rating, content } = request.only(['productId', 'rating', 'content'])

      const review = await Review.create({
        productId,
        rating,
        content,
      })

      return response.ok({ success: true, review })
    } catch (error) {
      return response.badRequest({ success: false, error: (error as Error).message })
    }
  }

  // Create affiliate link
  async createAffiliateLink({ request, response, auth }: HttpContext) {
    try {
      const { productId } = request.only(['productId'])

      const link = await AffiliateLink.create({
        affiliateId: auth.user!.id,
        productId,
      })

      return response.ok({ success: true, link })
    } catch (error) {
      return response.badRequest({ success: false, error: (error as Error).message })
    }
  }

  // Track affiliate redirect and get product
  async affiliateRedirect({ request, response }: HttpContext) {
    try {
      const { link_code: linkCode } = request.only(['link_code'])

      // Find affiliate link by code
      const link = await AffiliateLink.query().where('code', linkCode).first()

      if (!link) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return response.notFound({ product_id: null })
      }

      // eslint-disable-next-line @typescript-eslint/naming-convention
      return response.ok({ product_id: link.productId })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  // Process order
  async createOrder({ request, response, auth }: HttpContext) {
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { product_id: productId } = request.only(['product_id', 'affiliate_link_code'])

      const product = await Product.findOrFail(productId)
      
      // Determine status based on product type
      const initialStatus = product.productType === 'digital' ? 'completed' : 'processing'

      const order = await Order.create({
        buyerId: auth.user!.id,
        buyerEmail: auth.user!.email,
        productId,
        productName: product.name,
        vendorId: product.vendorId,
        amount: product.price,
        vendorPayout: product.price, // Simplified, should use RevenueService
        status: initialStatus,
      })

      // Handle appropriate notifications
      const { NotificationService } = await import('#services/notification_service')
      
      if (initialStatus === 'completed') {
        // Digital product
        const { WalletService } = await import('#services/wallet_service')
        await WalletService.handleOrderCompleted(order)
        await NotificationService.notifyOrderCompleted(order, product)
        console.log(`[ApiController] Digital product completed: ${order.orderNumber}`)
      } else {
        // Physical product
        await NotificationService.notifyOrderProcessing(order, product)
        console.log(`[ApiController] Physical product set to processing: ${order.orderNumber}`)
      }

      return response.ok({ success: true, order })
    } catch (error) {
      return response.badRequest({ success: false, error: (error as Error).message })
    }
  }
}
