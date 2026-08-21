import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import User from '#models/user'
import drive from '@adonisjs/drive/services/main'
import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { ImageService } from '#services/image_service'

const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
const storageDisk = env.get('DRIVE')

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
      'payoutMethod',
      'payoutBankName',
      'payoutAccountNumber',
      'payoutAccountName',
      'payoutRoutingNumber',
      'payoutSwiftCode',
      'payoutMobileProvider',
      'payoutMobileNumber',
      'payoutEmail',
      'payoutAccountId',
    ])

    user.merge(updates)
    await user.save()

    // Resolve image URLs before returning
    const userData = user.serialize() as any
    userData.profilePicture = await ImageService.getUrl(user.profilePicture)
    userData.coverBanner = await ImageService.getUrl(user.coverBanner)

    return response.json({ success: true, user: userData })
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
      'payoutMethod',
      'payoutBankName',
      'payoutAccountNumber',
      'payoutAccountName',
      'payoutRoutingNumber',
      'payoutSwiftCode',
      'payoutMobileProvider',
      'payoutMobileNumber',
      'payoutEmail',
      'payoutAccountId',
    ])

    user.merge(updates)
    await user.save()

    // Resolve image URLs before returning
    const userData = user.serialize() as any
    userData.profilePicture = await ImageService.getUrl(user.profilePicture)
    userData.businessLogo = await ImageService.getUrl(user.businessLogo)
    userData.coverBanner = await ImageService.getUrl(user.coverBanner)

    return response.json({ success: true, user: userData })
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

    try {
      await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
        contentType: file.headers['content-type'],
        visibility: 'public',
      })

      // Store only the key, not the full URL
      if (imageType === 'profile_picture') user.profilePicture = key
      else if (imageType === 'business_logo') user.businessLogo = key
      else if (imageType === 'cover_banner') user.coverBanner = key

      await user.save()

      // Return the URL for frontend display
      const url = await drive.use(storageDisk).getUrl(key)
      return response.json({ success: true, url, key })
    } catch (error) {
      console.error('Profile image upload error:', error)
      return response.internalServerError({ error: 'Failed to upload image' })
    }
  }
}
