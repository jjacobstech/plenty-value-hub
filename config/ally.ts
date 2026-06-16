import env from '#start/env'
import type { AllyConfig } from '@adonisjs/ally'

const allyConfig = {
  default: 'google',

  drivers: {
    google: {
      driver: 'google',
      clientId: env.get('GOOGLE_CLIENT_ID'),
      clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
      redirectUrl: `${env.get('APP_URL')}/auth/google/callback`,
    },
  },
} as AllyConfig

export default allyConfig
