import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const category = request.input('category')
    const productType = request.input('product_type')
    const search = request.input('search')
    const sort = request.input('sort', '-created_at')

    let query = Product.query().where('status', 'approved')

    if (category) query = query.where('category', category)
    if (productType) query = query.where('product_type', productType)
    if (search) {
      query = query.where('name', 'like', `%${search}%`)
        .orWhere('short_description', 'like', `%${search}%`)
    }

    if (sort === '-created_at') query = query.orderBy('created_at', 'desc')
    if (sort === '-total_sales') query = query.orderBy('total_sales', 'desc')
    if (sort === '-gravity_score') query = query.orderBy('gravity_score', 'desc')

    const products = await query.paginate(page, limit)

    return response.json({
      success: true,
      data: products.all(),
      pagination: {
        total: products.total,
        perPage: products.perPage,
        currentPage: products.currentPage,
        lastPage: products.lastPage,
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.query()
      .where('id', params.id)
      .where('status', 'approved')
      .preload('vendor')
      .preload('reviews', (query) => query.where('status', 'approved'))
      .first()

    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    return response.json({
      success: true,
      data: product.serialize(),
    })
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can create products' })
    }

    const payload = await request.validateUsing(createProductValidator)

    const product = await Product.create({
      ...payload,
      vendorId: user.id,
      vendorName: user.fullName || user.email,
      status: 'pending',
      gravityScore: 0,
      totalSales: 0,
      totalRevenue: 0,
      reviewCount: 0,
    })

    return response.status(201).json({
      success: true,
      message: 'Product submitted for approval',
      data: product.serialize(),
    })
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const product = await Product.find(params.id)

    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    if (user.role !== 'admin' && product.vendorId !== user.id) {
      return response.status(403).json({ error: 'Not authorized to update this product' })
    }

    const payload = await request.validateUsing(updateProductValidator)

    product.merge(payload)
    await product.save()

    return response.json({
      success: true,
      message: 'Product updated',
      data: product.serialize(),
    })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const product = await Product.find(params.id)

    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    if (user.role !== 'admin' && product.vendorId !== user.id) {
      return response.status(403).json({ error: 'Not authorized to delete this product' })
    }

    await product.delete()

    return response.json({
      success: true,
      message: 'Product deleted',
    })
  }

  async approve({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve products' })
    }

    const product = await Product.find(params.id)

    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    const newStatus = request.input('status')
    if (!['approved', 'rejected', 'archived'].includes(newStatus)) {
      return response.status(400).json({ error: 'Invalid status' })
    }

    product.status = newStatus
    await product.save()

    return response.json({
      success: true,
      message: `Product ${newStatus}`,
      data: product.serialize(),
    })
  }
}