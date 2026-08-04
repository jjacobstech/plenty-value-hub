import UserTransformer from '#transformers/user_transformer';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';
export default class InertiaMiddleware extends BaseInertiaMiddleware {
    share(ctx) {
        const { session, auth } = ctx;
        const flashedErrors = session?.flashMessages.get('errors');
        const error = session?.flashMessages.get('error');
        const success = session?.flashMessages.get('success');
        return {
            errors: ctx.inertia.always({
                ...this.getValidationErrors(ctx),
                ...(flashedErrors ?? {}),
            }),
            flash: ctx.inertia.always({
                error,
                success,
            }),
            user: ctx.inertia.always(auth?.user ? UserTransformer.transform(auth.user) : undefined),
        };
    }
    async handle(ctx, next) {
        await this.init(ctx);
        const output = await next();
        this.dispose(ctx);
        return output;
    }
}
//# sourceMappingURL=inertia_middleware.js.map