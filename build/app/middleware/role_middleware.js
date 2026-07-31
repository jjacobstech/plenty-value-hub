import { Exception } from '@adonisjs/core/exceptions';
export default class RoleMiddleware {
    handle(ctx, next, roles) {
        const user = ctx.auth.user;
        if (!user) {
            throw new Exception('Not authenticated', { status: 401 });
        }
        if (!roles.includes(user.role)) {
            throw new Exception('You do not have permission to access this resource', { status: 403 });
        }
        return next();
    }
}
//# sourceMappingURL=role_middleware.js.map