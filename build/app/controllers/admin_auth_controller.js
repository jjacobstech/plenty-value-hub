import User from '#models/user';
import { randomBytes } from 'node:crypto';
import { DateTime } from 'luxon';
export default class AdminAuthController {
    async entry({ auth, response }) {
        await auth.use('web').check();
        if (auth.use('web').isAuthenticated && auth.use('web').user?.role === 'admin') {
            return response.redirect('/admin');
        }
        return response.redirect('/admin/auth/login');
    }
    async loginPage({ inertia, auth, response }) {
        await auth.use('web').check();
        if (auth.use('web').isAuthenticated && auth.use('web').user?.role === 'admin') {
            return response.redirect('/admin');
        }
        const adminExists = !!(await User.query().where('role', 'admin').first());
        return inertia.render('admin/AdminLogin', { adminExists });
    }
    async redirectToGoogleSetup({ ally, session }) {
        session.put('admin_oauth_source', 'setup');
        return ally.use('googleAdmin').redirect();
    }
    async redirectToGoogleLogin({ ally, session }) {
        session.put('admin_oauth_source', 'login');
        return ally.use('googleAdmin').redirect();
    }
    async handleGoogleCallback({ ally, auth, session, response }) {
        const google = ally.use('googleAdmin');
        if (google.accessDenied()) {
            return response.redirect('/admin/auth/login?error=access_denied');
        }
        if (google.stateMisMatch()) {
            return response.redirect('/admin/auth/login?error=state_mismatch');
        }
        if (google.hasError()) {
            return response.redirect('/admin/auth/login?error=oauth_error');
        }
        let googleUser;
        try {
            googleUser = await google.user();
        }
        catch {
            return response.redirect('/admin/auth/login?error=oauth_error');
        }
        if (!googleUser.email) {
            return response.redirect('/admin/auth/login?error=no_email');
        }
        const source = session.pull('admin_oauth_source', 'login');
        if (source === 'setup') {
            const adminExists = await User.query().where('role', 'admin').first();
            if (adminExists) {
                return response.redirect('/admin/auth/login?error=admin_exists');
            }
            const existingUser = await User.findBy('email', googleUser.email);
            if (existingUser) {
                return response.redirect('/admin/auth/login?error=email_taken');
            }
            const admin = await User.create({
                email: googleUser.email,
                fullName: googleUser.name ?? undefined,
                role: 'admin',
                password: randomBytes(32).toString('hex'),
                emailVerifiedAt: DateTime.now(),
            });
            await auth.use('web').login(admin);
            return response.redirect('/admin');
        }
        const user = await User.findBy('email', googleUser.email);
        if (!user || user.role !== 'admin') {
            return response.redirect('/admin/auth/login?error=not_admin');
        }
        await auth.use('web').login(user);
        return response.redirect('/admin');
    }
}
//# sourceMappingURL=admin_auth_controller.js.map