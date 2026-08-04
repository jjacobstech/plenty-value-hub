import drive from '@adonisjs/drive/services/main'
import env from '#start/env'

const storageDisk = env.get('DRIVE')

export default class S3UrlService {
  public static async getUrl(key: string | null): Promise<string | null> {
    if (!key) {
      return null
    }

    return drive.use(storageDisk).getUrl(key)
  }

  public static async getUrls(keys: (string | null)[]): Promise<(string | null)[]> {
    return Promise.all(keys.map((key) => this.getUrl(key)))
  }
}
