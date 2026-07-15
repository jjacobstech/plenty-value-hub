import BlogPost from '#models/blog_post'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class BlogPostsController {
  async index({ response }: HttpContext) {
    const posts = await BlogPost.query().orderBy('created_at', 'desc').limit(100)
    return response.json(posts.map((p) => p.serialize()))
  }

  async store({ request, response }: HttpContext) {
    const body = request.body() as Record<string, any>
    const slug =
      body.slug ||
      (body.title || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

    const wordCount = ((body.content || '').replace(/<[^>]+>/g, '').match(/\S+/g) || []).length
    const readTimeMinutes = Math.max(1, Math.round(wordCount / 200))

    const post = await BlogPost.create({
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content || null,
      featuredImageUrl: body.featured_image_url || null,
      category: body.category || null,
      tags: body.tags || [],
      authorName: body.author_name || null,
      status: body.status || 'draft',
      seoTitle: body.seo_title || null,
      seoDescription: body.seo_description || null,
      readTimeMinutes,
      viewCount: 0,
      publishedAt: body.status === 'published' ? DateTime.now() : null,
    })

    return response.json(post.serialize())
  }

  async update({ params, request, response }: HttpContext) {
    const post = await BlogPost.findOrFail(params.id)
    const body = request.body() as Record<string, any>

    const wordCount = (
      (body.content || post.content || '').replace(/<[^>]+>/g, '').match(/\S+/g) || []
    ).length
    const readTimeMinutes = Math.max(1, Math.round(wordCount / 200))

    post.merge({
      title: body.title ?? post.title,
      slug: body.slug ?? post.slug,
      excerpt: body.excerpt ?? post.excerpt,
      content: body.content ?? post.content,
      featuredImageUrl: body.featured_image_url ?? post.featuredImageUrl,
      category: body.category ?? post.category,
      tags: body.tags ?? post.tags,
      authorName: body.author_name ?? post.authorName,
      status: body.status ?? post.status,
      seoTitle: body.seo_title ?? post.seoTitle,
      seoDescription: body.seo_description ?? post.seoDescription,
      readTimeMinutes,
    })

    if (body.status === 'published' && !post.publishedAt) {
      post.publishedAt = DateTime.now()
    }

    await post.save()
    return response.json(post.serialize())
  }

  async destroy({ params, response }: HttpContext) {
    const post = await BlogPost.findOrFail(params.id)
    await post.delete()
    return response.json({ success: true })
  }
}
