export default class GuestMiddleware {
    redirectTo = '/';
    async handle(ctx, next, options = {}) {
        for (let guard of options.guards || [ctx.auth.defaultGuard]) {
            if (await ctx.auth.use(guard).check()) {
                ctx.session.reflash();
                return ctx.response.redirect(this.redirectTo, true);
            }
        }
        return next();
    }
}
//# sourceMappingURL=guest_middleware.js.map