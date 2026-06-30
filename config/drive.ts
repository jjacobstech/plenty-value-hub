import env from '#start/env'
import { defineConfig, services } from '@adonisjs/drive'
import type { InferDriveDisks } from '@adonisjs/drive/types'

const driveConfig = defineConfig({
  default: 's3',
  services: {
    fs: services.fs({
      location: new URL('../storage/uploads', import.meta.url),
      visibility: 'public',
      serveFiles: true,
      routeBasePath: '/uploads',
    }),

    s3: services.s3({
      credentials: {
        accessKeyId: env.get('S3_ACCESS_KEY'),
        secretAccessKey: env.get('S3_SECRET_KEY').release(),
      },
      region: env.get('S3_REGION'),
      bucket: env.get('S3_BUCKET'),
      endpoint: env.get('S3_ENDPOINT'),
      // Required for Garage — it does not support virtual-hosted-style URLs
      forcePathStyle: true,
      visibility: 'public',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
