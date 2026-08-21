import drive from '@adonisjs/drive/services/main'
import env from '#start/env'

/**
 * Image Service
 * Handles image URL resolution from storage keys
 */
export class ImageService {
  /**
   * Resolve a storage key to a full URL
   * Handles both storage keys and full URLs
   */
  static async getUrl(imageKey: string | null): Promise<string | null> {
    if (!imageKey) return null

    // If it's already a full URL, return it
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      return imageKey
    }

    try {
      const storageDisk = env.get('DRIVE')
      const url = await drive.use(storageDisk).getUrl(imageKey)
      return url
    } catch (error) {
      console.error('Failed to resolve image URL:', error)
      return null
    }
  }

  /**
   * Resolve multiple storage keys to URLs
   */
  static async getUrls(imageKeys: (string | null)[]): Promise<(string | null)[]> {
    return Promise.all(imageKeys.map((key) => this.getUrl(key)))
  }

  /**
   * Check if an image key/URL is valid and accessible
   */
  static async isAccessible(imageKey: string | null): Promise<boolean> {
    if (!imageKey) return false

    try {
      const storageDisk = env.get('DRIVE')
      const exists = await drive.use(storageDisk).exists(imageKey)
      return exists
    } catch {
      return false
    }
  }
}

export default ImageService
