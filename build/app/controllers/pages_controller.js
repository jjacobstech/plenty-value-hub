import User from '#models/user';
import Product from '#models/product';
import Review from '#models/review';
import Order from '#models/order';
import AffiliateLink from '#models/affiliate_link';
import NewsletterSubscriber from '#models/newsletter_subscriber';
import BlogPost from '#models/blog_post';
import Newsletter from '#models/newsletter';
import EmailCampaign from '#models/email_campaign';
import SiteSetting from '#models/site_setting';
import db from '@adonisjs/lucid/services/db';
export default class PagesController {
    async home({ inertia }) {
        const [featuredProducts, trendingProducts, heroBanner] = await Promise.all([
            Product.query()
                .where('status', 'approved')
                .where('is_featured', true)
                .orderBy('created_at', 'desc')
                .limit(8),
            Product.query().where('status', 'approved').orderBy('gravity_score', 'desc').limit(4),
            SiteSetting.findBy('key', 'hero_banner'),
        ]);
        return inertia.render('Home', {
            featuredProducts,
            trendingProducts,
            heroBannerImage: heroBanner?.value || '/hero-banner.png',
        });
    }
    async marketplace({ inertia }) {
        const products = await Product.query().where('status', 'approved').limit(100);
        return inertia.render('Marketplace', { products });
    }
    async reviews({ inertia }) {
        const reviews = await Review.query()
            .where('status', 'approved')
            .orderBy('created_at', 'desc')
            .limit(50);
        return inertia.render('Reviews', { reviews });
    }
    async productDetail({ inertia, params }) {
        const product = await Product.findOrFail(params.id);
        const reviews = await Review.query().where('product_id', params.id);
        return inertia.render('ProductDetail', { product, reviews });
    }
    async affiliateRedirect({ inertia, params }) {
        return inertia.render('AffiliateRedirect', { link_code: params.link_code });
    }
    async forPartners({ inertia }) {
        return inertia.render('ForPartners', {});
    }
    async privacyPolicy({ inertia }) {
        return inertia.render('PrivacyPolicy', {});
    }
    async verifyEmail({ inertia, session, response }) {
        const email = session.get('pending_verification_email');
        if (!email) {
            return response.redirect('/auth/signup');
        }
        return inertia.render('auth/VerifyEmail', { email });
    }
    async forgotPassword({ inertia }) {
        return inertia.render('auth/forgot-password', {});
    }
    async resetPassword({ inertia }) {
        return inertia.render('auth/reset-password', {});
    }
    async adminDashboard({ inertia, auth }) {
        const [users, products, orders, subscriberCount] = await Promise.all([
            User.all(),
            Product.all(),
            Order.query().orderBy('created_at', 'desc').limit(500),
            NewsletterSubscriber.query().count('* as total').first(),
        ]);
        return inertia.render('admin/AdminDashboard', {
            user: auth.user,
            users,
            products,
            orders,
            subscriberCount: Number(subscriberCount?.$extras?.total ?? 0),
        });
    }
    async adminUsers({ inertia, auth }) {
        const users = await User.query().orderBy('created_at', 'desc').limit(200);
        return inertia.render('admin/AdminUsers', { user: auth.user, users });
    }
    async adminProducts({ inertia, auth }) {
        const products = await Product.query().orderBy('created_at', 'desc').limit(200);
        return inertia.render('admin/AdminProducts', { user: auth.user, products });
    }
    async adminOrders({ inertia, auth }) {
        const orders = await Order.query().orderBy('created_at', 'desc').limit(200);
        return inertia.render('admin/AdminOrders', { user: auth.user, orders });
    }
    async adminAnalytics({ inertia, auth }) {
        const [users, products, orders, links] = await Promise.all([
            User.all(),
            Product.all(),
            Order.query().orderBy('created_at', 'desc').limit(500),
            AffiliateLink.all(),
        ]);
        return inertia.render('admin/AdminAnalytics', {
            user: auth.user,
            users,
            products,
            orders,
            links,
        });
    }
    async vendorDashboard({ inertia, auth }) {
        const vendorProducts = await Product.query().where('vendor_id', auth.user.id);
        const vendorOrders = await Order.query()
            .join('products', 'orders.product_id', 'products.id')
            .where('products.vendor_id', auth.user.id);
        return inertia.render('vendor/VendorDashboard', {
            user: auth.user,
            products: vendorProducts,
            orders: vendorOrders,
        });
    }
    async vendorProducts({ inertia, auth }) {
        const products = await Product.query().where('vendor_id', auth.user.id);
        return inertia.render('vendor/VendorProducts', { user: auth.user, products });
    }
    async vendorKYC({ inertia, auth }) {
        return inertia.render('VendorKYC', { user: auth.user });
    }
    async vendorEarnings({ inertia, auth }) {
        const orders = await Order.query()
            .join('products', 'orders.product_id', 'products.id')
            .where('products.vendor_id', auth.user.id)
            .select('orders.*')
            .orderBy('orders.created_at', 'desc');
        return inertia.render('vendor/VendorEarnings', { user: auth.user, orders });
    }
    async vendorAnalytics({ inertia, auth }) {
        const orders = await Order.query()
            .join('products', 'orders.product_id', 'products.id')
            .where('products.vendor_id', auth.user.id)
            .select('orders.*')
            .orderBy('orders.created_at', 'desc');
        const products = await Product.query().where('vendor_id', auth.user.id);
        return inertia.render('vendor/VendorAnalytics', { user: auth.user, orders, products });
    }
    async vendorProfile({ inertia, auth }) {
        const user = await User.query().where('id', auth.user.id).firstOrFail();
        return inertia.render('vendor/VendorProfile', { user: user.serialize() });
    }
    async affiliateDashboard({ inertia, auth }) {
        const links = await AffiliateLink.query().where('affiliate_id', auth.user.id);
        const orders = await Order.query()
            .where('affiliate_id', auth.user.id)
            .orderBy('created_at', 'desc');
        return inertia.render('affiliate/AffiliateDashboard', {
            user: auth.user,
            links,
            orders,
        });
    }
    async affiliateProducts({ inertia, auth }) {
        const products = await Product.query().where('status', 'approved').limit(50);
        return inertia.render('affiliate/AffiliateProducts', { user: auth.user, products });
    }
    async affiliateLinks({ inertia, auth }) {
        const links = await AffiliateLink.query().where('affiliate_id', auth.user.id);
        return inertia.render('affiliate/AffiliateLinks', { user: auth.user, links });
    }
    async affiliateEarnings({ inertia, auth }) {
        const orders = await Order.query()
            .where('affiliate_id', auth.user.id)
            .orderBy('created_at', 'desc');
        const links = await AffiliateLink.query().where('affiliate_id', auth.user.id);
        return inertia.render('affiliate/AffiliateEarnings', { user: auth.user, orders, links });
    }
    async affiliatePerformance({ inertia, auth }) {
        const links = await AffiliateLink.query().where('affiliate_id', auth.user.id);
        const performance = await Order.query()
            .where('affiliate_id', auth.user.id)
            .select(db.raw('DATE(created_at) as date'))
            .count('* as count')
            .groupByRaw('DATE(created_at)')
            .orderBy('date', 'asc');
        return inertia.render('affiliate/AffiliatePerformance', { user: auth.user, links, performance });
    }
    async affiliateProfile({ inertia, auth }) {
        const user = await User.query().where('id', auth.user.id).firstOrFail();
        return inertia.render('affiliate/AffiliateProfile', { user: user.serialize() });
    }
    async adminSubscribers({ inertia, auth }) {
        const subscribers = await NewsletterSubscriber.query().orderBy('created_at', 'desc').limit(500);
        return inertia.render('admin/AdminSubscribers', { user: auth.user, subscribers });
    }
    async adminBlog({ inertia, auth }) {
        const posts = await BlogPost.query().orderBy('created_at', 'desc').limit(100);
        return inertia.render('admin/AdminBlog', { user: auth.user, posts });
    }
    async adminNewsletterList({ inertia, auth }) {
        const newsletters = await Newsletter.query().orderBy('created_at', 'desc').limit(100);
        const subscriberCount = await NewsletterSubscriber.query()
            .where('status', 'active')
            .count('* as total')
            .first();
        return inertia.render('admin/AdminNewsletterList', {
            user: auth.user,
            newsletters,
            subscriberCount: Number(subscriberCount?.$extras?.total ?? 0),
        });
    }
    async adminNewsletter({ inertia, auth }) {
        const subscriberCount = await NewsletterSubscriber.query()
            .where('status', 'active')
            .count('* as total')
            .first();
        return inertia.render('admin/AdminNewsletter', {
            user: auth.user,
            subscriberCount: Number(subscriberCount?.$extras?.total ?? 0),
        });
    }
    async adminEmailCampaigns({ inertia, auth }) {
        const campaigns = await EmailCampaign.query().orderBy('created_at', 'desc').limit(100);
        const subscriberCount = await NewsletterSubscriber.query()
            .where('status', 'active')
            .count('* as total')
            .first();
        return inertia.render('admin/AdminEmailCampaigns', {
            user: auth.user,
            campaigns,
            subscriberCount: Number(subscriberCount?.$extras?.total ?? 0),
        });
    }
    async adminConversions({ inertia, auth }) {
        const [orders, links] = await Promise.all([
            Order.query().orderBy('created_at', 'desc').limit(500),
            AffiliateLink.query().orderBy('created_at', 'desc').limit(500),
        ]);
        return inertia.render('admin/AdminConversions', { user: auth.user, orders, links });
    }
    async adminHeroBanner({ inertia, auth }) {
        const settings = await SiteSetting.all();
        return inertia.render('admin/AdminHeroBanner', { user: auth.user, settings });
    }
}
//# sourceMappingURL=pages_controller.js.map