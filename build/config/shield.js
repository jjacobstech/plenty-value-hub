import { defineConfig } from '@adonisjs/shield';
import env from '#start/env';
const appUrl = env.get('APP_URL');
const s3Endpoint = env.get('S3_ENDPOINT');
const s3Url = `${s3Endpoint}/*`;
console.log({ appUrl, s3Url });
const shieldConfig = defineConfig({
    csp: {
        enabled: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http://localhost:*', `${appUrl}`, `${s3Url}`],
            fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
            connectSrc: ["'self'", 'ws://localhost:*', 'http://localhost:*', appUrl, s3Url],
        },
        reportOnly: false,
    },
    csrf: {
        enabled: true,
        exceptRoutes: [],
        enableXsrfCookie: true,
        methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    },
    xFrame: {
        enabled: true,
        action: 'DENY',
    },
    hsts: {
        enabled: true,
        maxAge: '180 days',
        includeSubDomains: true,
    },
    contentTypeSniffing: {
        enabled: true,
    },
});
export default shieldConfig;
//# sourceMappingURL=shield.js.map