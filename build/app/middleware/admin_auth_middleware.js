export default class AdminAuthMiddleware {
    redirectTo = '/admin/auth/login';
    async handle(ctx, next, options = {}) {
        await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo });
        return next();
    }
}
//# sourceMappingURL=admin_auth_middleware.js.map