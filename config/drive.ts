import { defineConfig, services } from '@adonisjs/drive'
import type { InferDriveDisks } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: 'fs',
  services: {
    fs: services.fs({
      location: new URL('../storage/uploads', import.meta.url),
      visibility: 'public',
      serveFiles: true,
      routeBasePath: '/uploads',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
