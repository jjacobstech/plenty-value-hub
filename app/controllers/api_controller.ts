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
      return response.badRequest({ success: false, error: error.message })
    }
  }

  // Create review
  async createReview({ request, response, auth }: HttpContext) {
    try {
      const { productId, rating, content } = request.only(['productId', 'rating', 'content'])

      const review = await Review.create({
        productId,
        userId: auth.user!.id,
        rating,
        content,
      })

      return response.ok({ success: true, review })
    } catch (error) {
      return response.badRequest({ success: false, error: error.message })
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
      return response.badRequest({ success: false, error: error.message })
    }
  }

  // Track affiliate redirect and get product
  async affiliateRedirect({ request, response }: HttpContext) {
    try {
      const { link_code } = request.only(['link_code'])

      // Find affiliate link by code
      const link = await AffiliateLink.query().where('code', link_code).first()

      if (!link) {
        return response.notFound({ product_id: null })
      }

      return response.ok({ product_id: link.productId })
    } catch (error) {
      return response.internalServerError({ error: error.message })
    }
  }

  // Process order
  async createOrder({ request, response, auth }: HttpContext) {
    try {
      const { product_id, affiliate_link_code } = request.only(['product_id', 'affiliate_link_code'])

      const product = await Product.findOrFail(product_id)

      const order = await Order.create({
        userId: auth.user!.id,
        productId: product_id,
        total: product.price,
        status: 'completed',
      })

      return response.ok({ success: true, order })
    } catch (error) {
      return response.badRequest({ success: false, error: error.message })
    }
  }
}
