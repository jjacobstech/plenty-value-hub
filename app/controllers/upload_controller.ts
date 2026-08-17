import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'
import { randomBytes } from 'crypto'
import { createReadStream } from 'fs'
import { extname } from 'path'
import { appUrl } from '#config/app'

type UploadContext = Pick<HttpContext, 'request' | 'auth' | 'response'>

const storageDisk = env.get('DRIVE')

const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const ALLOWED_VIDEO_TYPES = ['mp4', 'webm', 'mov', 'avi', 'mkv']
const ALLOWED_DOCUMENT_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']


const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024 // 25MB

/**
 * Unified Upload Controller
 * Handles all file uploads: images, videos, documents
 * Used by products, profiles, admin content, etc.
 */
export default class UploadController {
  /**
   * Upload product image
   * POST /api/uploads/product-image
   */
  async uploadProductImage({ request, auth, response }: UploadContext) {
    const user = await auth.use('web').user

    if (!user) {
      return response.unauthorized({
        success: false,
        error: 'Authentication required. Please log in to upload images.',
      })
    }

    if (user.role !== 'vendor' && user.role !== 'admin') {
      return response.forbidden({
        success: false,
        error: 'Only vendors and admins can upload product images.',
      })
    }

    const file = request.file('image', {
      size: MAX_IMAGE_SIZE,
      extnames: ALLOWED_IMAGE_TYPES,
    })

    if (!file) {
      return response.badRequest({
        success: false,
        error: 'No image file was provided. Please select an image to upload.',
      })
    }

    if (!file.isValid) {
      const errorMsg = file.errors[0]?.message || 'The uploaded file is not valid.'
      return response.unprocessableEntity({
        success: false,
        error: errorMsg,
      })
    }

    try {
      const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg'
      const key = `products/${user.id}/${randomBytes(12).toString('hex')}.${ext}`

      await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
        contentType: file.headers['content-type'],
        visibility: 'public',
      })

      const url = `${appUrl}${await drive.use(storageDisk).getUrl(key)}`

      return response.json({
        success: true,
        url,
        key,
      })
    } catch (error) {
      console.error('Product image upload error:', error)
      return response.internalServerError({
        success: false,
        error:
          'Failed to upload image. Please try again or contact support if the problem persists.',
      })
    }
  }

  /**
   * Upload product gallery images (multiple)
   * POST /api/uploads/product-gallery
   */
  async uploadProductGallery({ request, auth, response }: UploadContext) {
    const user = await auth.use('web').user

    if (!user) {
      return response.unauthorized({
        success: false,
        error: 'Authentication required. Please log in to upload images.',
      })
    }

    if (user.role !== 'vendor' && user.role !== 'admin') {
      return response.forbidden({
        success: false,
        error: 'Only vendors and admins can upload images.',
      })
    }

    const files = request.files('images', {
      size: MAX_IMAGE_SIZE,
      extnames: ALLOWED_IMAGE_TYPES,
    })

    if (!files || files.length === 0) {
      return response.badRequest({
        success: false,
        error: 'No images were provided. Please select at least one image to upload.',
      })
    }

    const results = []

    for (const file of files) {
      if (!file.isValid) {
        results.push({
          success: false,
          filename: file.clientName,
          error: file.errors[0]?.message ?? 'Invalid file',
        })
        continue
      }

      try {
        const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg'
        const key = `products/${user.id}/gallery/${randomBytes(12).toString('hex')}.${ext}`

        await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
          contentType: file.headers['content-type'],
          visibility: 'public',
        })

        const url = await drive.use(storageDisk).getUrl(key)
        results.push({
          success: true,
          url,
          key,
          filename: file.clientName,
        })
      } catch (error) {
        console.error(`Gallery upload error for ${file.clientName}:`, error)
        results.push({
          success: false,
          filename: file.clientName,
          error: 'Failed to upload this image. Please try again.',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    return response.json({
      success: successCount > 0,
      message: `Successfully uploaded ${successCount} of ${files.length} images`,
      results,
    })
  }

  /**
   * Upload profile image (avatar, logo, banner)
   * POST /api/uploads/profile-image
   */
  async uploadProfileImage({ request, auth, response }: UploadContext) {
    const user = await auth.use('web').user

    if (!user) {
      return response.unauthorized({
        success: false,
        error: 'Authentication required. Please log in to upload images.',
      })
    }

    const imageType = request.input('type', 'profile_picture') as
      | 'profile_picture'
      | 'business_logo'
      | 'cover_banner'

    const validTypes = ['profile_picture', 'business_logo', 'cover_banner']
    if (!validTypes.includes(imageType)) {
      return response.badRequest({
        success: false,
        error: 'Invalid image type. Must be: profile_picture, business_logo, or cover_banner.',
      })
    }

    const file = request.file('image', {
      size: MAX_IMAGE_SIZE,
      extnames: ALLOWED_IMAGE_TYPES,
    })

    if (!file) {
      return response.badRequest({
        success: false,
        error: 'No image file was provided. Please select an image to upload.',
      })
    }

    if (!file.isValid) {
      const errorMsg = file.errors[0]?.message || 'The uploaded file is not valid.'
      return response.unprocessableEntity({
        success: false,
        error: errorMsg,
      })
    }

    try {
      const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg'
      const key = `profiles/${user.id}/${imageType}/${randomBytes(8).toString('hex')}.${ext}`

      await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
        contentType: file.headers['content-type'],
        visibility: 'public',
      })

      const url = await drive.use(storageDisk).getUrl(key)

      return response.json({
        success: true,
        url,
        key,
      })
    } catch (error) {
      console.error('Profile image upload error:', error)
      return response.internalServerError({
        success: false,
        error:
          'Failed to upload image. Please try again or contact support if the problem persists.',
      })
    }
  }

  /**
   * Upload admin/site image (hero banner, blog featured image, etc)
   * POST /api/uploads/admin-image
   */
  async uploadAdminImage({ request, auth, response }: UploadContext) {
    const user = await auth.use('web').user

    if (!user || user.role !== 'admin') {
      return response.forbidden({
        success: false,
        error: 'Only administrators can upload admin images. Please log in with an admin account.',
      })
    }

    const imageType = request.input('type', 'general') as string

    const file = request.file('image', {
      size: MAX_IMAGE_SIZE,
      extnames: ALLOWED_IMAGE_TYPES,
    })

    if (!file) {
      return response.badRequest({
        success: false,
        error: 'No image file was provided. Please select an image to upload.',
      })
    }

    if (!file.isValid) {
      const errorMsg = file.errors[0]?.message || 'The uploaded file is not valid.'
      return response.unprocessableEntity({
        success: false,
        error: errorMsg,
      })
    }

    try {
      const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg'
      const key = `admin/${imageType}/${randomBytes(12).toString('hex')}.${ext}`

      await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
        contentType: file.headers['content-type'],
        visibility: 'public',
      })

      const url = await drive.use(storageDisk).getUrl(key)

      return response.json({
        success: true,
        url,
        key,
      })
    } catch (error) {
      console.error('Admin image upload error:', error)
      return response.internalServerError({
        success: false,
        error:
          'Failed to upload image. Please try again or contact support if the problem persists.',
      })
    }
  }

  /**
   * Upload video (for admin editor, blog posts, etc)
   * POST /api/uploads/video
   */
  async uploadVideo({ request, auth, response }: UploadContext) {
    const user = await auth.use('web').user

    if (!user || user.role !== 'admin') {
      return response.forbidden({
        success: false,
        error: 'Only administrators can upload videos. Please log in with an admin account.',
      })
    }

    const file = request.file('video', {
      size: MAX_VIDEO_SIZE,
      extnames: ALLOWED_VIDEO_TYPES,
    })

    if (!file) {
      return response.badRequest({
        success: false,
        error: 'No video file was provided. Please select a video to upload.',
      })
    }

    if (!file.isValid) {
      const errorMsg = file.errors[0]?.message || 'The uploaded video file is not valid.'
      return response.unprocessableEntity({
        success: false,
        error: errorMsg,
      })
    }

    try {
      const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'mp4'
      const key = `videos/${randomBytes(12).toString('hex')}.${ext}`

      await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
        contentType: file.headers['content-type'],
        visibility: 'public',
      })

      const url = await drive.use(storageDisk).getUrl(key)

      return response.json({
        success: true,
        url,
        key,
      })
    } catch (error) {
      console.error('Video upload error:', error)
      return response.internalServerError({
        success: false,
        error:
          'Failed to upload video. Please try again or contact support if the problem persists.',
      })
    }
  }

  /**
   * Upload document (for admin, vendor documents)
   * POST /api/uploads/document
   */
  async uploadDocument({ request, auth, response }: UploadContext) {
    const user = await auth.use('web').user

    if (!user) {
      return response.unauthorized({
        success: false,
        error: 'Authentication required. Please log in to upload documents.',
      })
    }

    const file = request.file('document', {
      size: MAX_DOCUMENT_SIZE,
      extnames: ALLOWED_DOCUMENT_TYPES,
    })

    if (!file) {
      return response.badRequest({
        success: false,
        error: 'No document file was provided. Please select a document to upload.',
      })
    }

    if (!file.isValid) {
      const errorMsg = file.errors[0]?.message || 'The uploaded document file is not valid.'
      return response.unprocessableEntity({
        success: false,
        error: errorMsg,
      })
    }

    try {
      const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'pdf'
      const folder = user.role === 'admin' ? 'admin' : 'user'
      const key = `documents/${folder}/${user.id}/${randomBytes(12).toString('hex')}.${ext}`

      await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
        contentType: file.headers['content-type'],
        visibility: 'public',
      })

      const url = await drive.use(storageDisk).getUrl(key)

      return response.json({
        success: true,
        url,
        key,
        filename: file.clientName,
      })
    } catch (error) {
      console.error('Document upload error:', error)
      return response.internalServerError({
        success: false,
        error:
          'Failed to upload document. Please try again or contact support if the problem persists.',
      })
    }
  }

  /**
   * Generic file upload (for compatibility)
   * POST /api/uploads/file
   */
  async uploadFile({ request, auth, response }: UploadContext) {
    const user = await auth.use('web').user

    if (!user) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    const uploadType = request.input('type', 'image') as 'image' | 'video' | 'document'
    const file = request.file('file')

    if (!file) {
      return response.badRequest({ error: 'No file provided' })
    }

    // Route to appropriate handler
    if (uploadType === 'image') {
      // Reuse image upload logic
      return this.uploadProductImage({ request, auth, response })
    } else if (uploadType === 'video') {
      return this.uploadVideo({ request, auth, response })
    } else if (uploadType === 'document') {
      return this.uploadDocument({ request, auth, response })
    }

    return response.badRequest({ error: 'Invalid upload type' })
  }
}
