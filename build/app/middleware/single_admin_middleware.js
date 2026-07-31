import User from '#models/user';
export default class SingleAdminMiddleware {
    async handle({ response }, next) {
        const adminExists = await User.query().where('role', 'admin').first();
        if (adminExists) {
            return response.redirect('/admin/auth/login?error=admin_exists');
        }
        return next();
    }
}
//# sourceMappingURL=single_admin_middleware.js.map