import env from '#start/env';
import { defineConfig, services } from '@adonisjs/ally';
const allyConfig = defineConfig({
    google: services.google({
        clientId: env.get('GOOGLE_CLIENT_ID'),
        clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
        callbackUrl: `${env.get('APP_URL')}/auth/google/callback`,
    }),
    googleAdmin: services.google({
        clientId: env.get('GOOGLE_CLIENT_ID'),
        clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
        callbackUrl: `${env.get('APP_URL')}/admin/auth/google/callback`,
    }),
});
export default allyConfig;
//# sourceMappingURL=ally.js.map