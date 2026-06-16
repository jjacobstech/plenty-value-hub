import Review from '#models/review'
import Product from '#models/product'
import { createReviewValidator, updateReviewValidator } from '#validators/review'
import type { HttpContext } from '@adonisjs/core/http'

export default class ReviewsController {
  async index({ request, response }: HttpContext) {
    const productId = request.input('product_id')
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    if (!productId) {
      return response.status(400).json({ error: 'product_id is required' })
    }

    const reviews = await Review.query()
      .where('productId', productId)
      .where('status', 'approved')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: reviews.all(),
      pagination: {
        total: reviews.total,
        perPage: reviews.perPage,
        currentPage: reviews.currentPage,
        lastPage: reviews.lastPage,
      },
    })
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const payload = await request.validateUsing(createReviewValidator)

    const product = await Product.find(payload.productId)
    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    const review = await Review.create({
      productId: payload.productId,
      productName: product.name,
      reviewerName: user.fullName || user.email,
      rating: payload.rating,
      title: payload.title,
      content: payload.content,
      pros: payload.pros || [],
      cons: payload.cons || [],
      status: 'pending',
      isVerifiedPurchase: false,
      helpfulCount: 0,
    })

    return response.status(201).json({
      success: true,
      message: 'Review submitted for approval',
      data: review.serialize(),
    })
  }

  async approve({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve reviews' })
    }

    const review = await Review.find(params.id)
    if (!review) {
      return response.status(404).json({ error: 'Review not found' })
    }

    const payload = await request.validateUsing(updateReviewValidator)

    review.status = payload.status
    await review.save()

    if (payload.status === 'approved') {
      const product = await Product.find(review.productId)
      if (product) {
        product.reviewCount = (product.reviewCount || 0) + 1

        const allReviews = await Review.query()
          .where('productId', review.productId)
          .where('status', 'approved')

        const avgRating =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

        product.rating = Math.round(avgRating * 100) / 100
        await product.save()
      }
    }

    return response.json({
      success: true,
      message: `Review ${payload.status}`,
      data: review.serialize(),
    })
  }
}