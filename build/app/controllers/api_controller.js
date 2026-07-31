import Product from '#models/product';
import NewsletterSubscriber from '#models/newsletter_subscriber';
import AffiliateLink from '#models/affiliate_link';
import Review from '#models/review';
import Order from '#models/order';
export default class ApiController {
    async subscribeNewsletter({ request, response }) {
        try {
            const { email, source } = request.only(['email', 'source']);
            const subscriber = await NewsletterSubscriber.create({
                email,
                source: source || 'app',
            });
            return response.ok({ success: true, subscriber });
        }
        catch (error) {
            return response.badRequest({ success: false, error: error.message });
        }
    }
    async createReview({ request, response }) {
        try {
            const { productId, rating, content } = request.only(['productId', 'rating', 'content']);
            const review = await Review.create({
                productId,
                rating,
                content,
            });
            return response.ok({ success: true, review });
        }
        catch (error) {
            return response.badRequest({ success: false, error: error.message });
        }
    }
    async createAffiliateLink({ request, response, auth }) {
        try {
            const { productId } = request.only(['productId']);
            const link = await AffiliateLink.create({
                affiliateId: auth.user.id,
                productId,
            });
            return response.ok({ success: true, link });
        }
        catch (error) {
            return response.badRequest({ success: false, error: error.message });
        }
    }
    async affiliateRedirect({ request, response }) {
        try {
            const { link_code: linkCode } = request.only(['link_code']);
            const link = await AffiliateLink.query().where('code', linkCode).first();
            if (!link) {
                return response.notFound({ product_id: null });
            }
            return response.ok({ product_id: link.productId });
        }
        catch (error) {
            return response.internalServerError({ error: error.message });
        }
    }
    async createOrder({ request, response, auth }) {
        try {
            const { product_id: productId } = request.only(['product_id', 'affiliate_link_code']);
            const product = await Product.findOrFail(productId);
            const order = await Order.create({
                buyerId: auth.user.id,
                productId,
                amount: product.price,
                status: 'completed',
            });
            return response.ok({ success: true, order });
        }
        catch (error) {
            return response.badRequest({ success: false, error: error.message });
        }
    }
}
//# sourceMappingURL=api_controller.js.map