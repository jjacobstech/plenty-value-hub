import env from '#start/env';
import { defineConfig, transports } from '@adonisjs/mail';
const mailConfig = defineConfig({
    default: env.get('MAIL_MAILER'),
    from: {
        address: env.get('MAIL_FROM_ADDRESS'),
        name: env.get('MAIL_FROM_NAME'),
    },
    globals: {
        brandName: 'Acme',
    },
    mailers: {
        smtp: transports.smtp({
            host: env.get('SMTP_HOST'),
            port: env.get('SMTP_PORT'),
        }),
    },
});
export default mailConfig;
//# sourceMappingURL=mail.js.map