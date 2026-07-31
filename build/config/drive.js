import env from '#start/env';
import { defineConfig, services } from '@adonisjs/drive';
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
            forcePathStyle: true,
            visibility: 'public',
        }),
    },
});
export default driveConfig;
//# sourceMappingURL=drive.js.map