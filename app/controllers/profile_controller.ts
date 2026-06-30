import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import drive from '@adonisjs/drive/services/main'
import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { randomBytes } from 'node:crypto'

const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

function pickPresent(body: Record<string, any>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of keys) {
    if (key in body && body[key] !== null && body[key] !== undefined && body[key] !== '') {
      out[key] = String(body[key]).trim()
    }
  }
  return out
}

export default class ProfileController {
  async updateAffiliate({ request, response, auth }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)
    const body = request.body() as Record<string, any>

    const updates = pickPresent(body, [
      'bio',
      'phone',
      'website',
      'instagram',
      'twitter',
      'youtube',
      'location',
      'niche',
      'marketingChannels',
    ])

    user.merge(updates)
    await user.save()

    return response.json({ success: true, user: user.serialize() })
  }

  async updateVendor({ request, response, auth }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)
    const body = request.body() as Record<string, any>

    const updates = pickPresent(body, [
      'businessName',
      'businessDescription',
      'phone',
      'website',
      'instagram',
      'twitter',
      'location',
      'productCategories',
    ])

    user.merge(updates)
    await user.save()

    return response.json({ success: true, user: user.serialize() })
  }

  async uploadImage({ request, response, auth }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)
    const imageType = request.input('type', 'profile_picture') as
      | 'profile_picture'
      | 'business_logo'
      | 'cover_banner'

    const file = request.file('image', {
      size: MAX_IMAGE_SIZE,
      extnames: ALLOWED_IMAGE_TYPES,
    })

    if (!file) {
      return response.badRequest({ error: 'No image file provided' })
    }

    if (!file.isValid) {
      return response.unprocessableEntity({ error: file.errors[0]?.message ?? 'Invalid file' })
    }

    const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg'
    const key = `profiles/${user.id}/${imageType}/${randomBytes(8).toString('hex')}.${ext}`

    await drive.use('fs').putStream(key, createReadStream(file.tmpPath!), {
      contentType: file.headers['content-type'],
      visibility: 'public',
    })

    const url = await drive.use('fs').getUrl(key)

    if (imageType === 'profile_picture') user.profilePicture = url
    else if (imageType === 'business_logo') user.businessLogo = url
    else if (imageType === 'cover_banner') user.coverBanner = url

    await user.save()
    return response.json({ success: true, url })
  }
}
