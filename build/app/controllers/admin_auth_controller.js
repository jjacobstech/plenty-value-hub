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
            session.flash('error', 'Google sign-in was cancelled.');
            return response.redirect('/admin/auth/login');
        }
        if (google.stateMisMatch()) {
            session.flash('error', 'Authentication state mismatch. Please try again.');
            return response.redirect('/admin/auth/login');
        }
        if (google.hasError()) {
            session.flash('error', 'Google authentication failed. Please try again.');
            return response.redirect('/admin/auth/login');
        }
        let googleUser;
        try {
            googleUser = await google.user();
        }
        catch {
            session.flash('error', 'Google authentication failed. Please try again.');
            return response.redirect('/admin/auth/login');
        }
        if (!googleUser.email) {
            session.flash('error', 'Google did not provide an email address.');
            return response.redirect('/admin/auth/login');
        }
        const source = session.pull('admin_oauth_source', 'login');
        if (source === 'setup') {
            const adminExists = await User.query().where('role', 'admin').first();
            if (adminExists) {
                session.flash('error', 'An admin account already exists. Only one admin is allowed.');
                return response.redirect('/admin/auth/login');
            }
            const existingUser = await User.findBy('email', googleUser.email);
            if (existingUser) {
                session.flash('error', 'That Google account is already registered under a different role.');
                return response.redirect('/admin/auth/login');
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
            session.flash('error', 'That Google account does not have admin access.');
            return response.redirect('/admin/auth/login');
        }
        await auth.use('web').login(user);
        return response.redirect('/admin');
    }
}
//# sourceMappingURL=admin_auth_controller.js.map