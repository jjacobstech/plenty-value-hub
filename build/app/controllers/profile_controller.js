import env from '#start/env';
import User from '#models/user';
import drive from '@adonisjs/drive/services/main';
import { createReadStream } from 'node:fs';
import { extname } from 'node:path';
import { randomBytes } from 'node:crypto';
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const storageDisk = env.get('DRIVE');
function pickPresent(body, keys) {
    const out = {};
    for (const key of keys) {
        if (key in body && body[key] !== null && body[key] !== undefined && body[key] !== '') {
            out[key] = String(body[key]).trim();
        }
    }
    return out;
}
export default class ProfileController {
    async updateAffiliate({ request, response, auth }) {
        const user = await User.findOrFail(auth.user.id);
        const body = request.body();
        const updates = pickPresent(body, [
            'bio',
            'phone',
            'website',
            'instagram',
            'twitter',
            'youtube',
            'location',
            'niche',
            'marketingChannels',
        ]);
        user.merge(updates);
        await user.save();
        return response.json({ success: true, user: user.serialize() });
    }
    async updateVendor({ request, response, auth }) {
        const user = await User.findOrFail(auth.user.id);
        const body = request.body();
        const updates = pickPresent(body, [
            'businessName',
            'businessDescription',
            'phone',
            'website',
            'instagram',
            'twitter',
            'location',
            'productCategories',
        ]);
        user.merge(updates);
        await user.save();
        return response.json({ success: true, user: user.serialize() });
    }
    async uploadImage({ request, response, auth }) {
        const user = await User.findOrFail(auth.user.id);
        const imageType = request.input('type', 'profile_picture');
        const file = request.file('image', {
            size: MAX_IMAGE_SIZE,
            extnames: ALLOWED_IMAGE_TYPES,
        });
        if (!file) {
            return response.badRequest({ error: 'No image file provided' });
        }
        if (!file.isValid) {
            return response.unprocessableEntity({ error: file.errors[0]?.message ?? 'Invalid file' });
        }
        const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg';
        const key = `profiles/${user.id}/${imageType}/${randomBytes(8).toString('hex')}.${ext}`;
        await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath), {
            contentType: file.headers['content-type'],
            visibility: 'public',
        });
        const url = await drive.use(storageDisk).getUrl(key);
        if (imageType === 'profile_picture')
            user.profilePicture = url;
        else if (imageType === 'business_logo')
            user.businessLogo = url;
        else if (imageType === 'cover_banner')
            user.coverBanner = url;
        await user.save();
        return response.json({ success: true, url });
    }
}
//# sourceMappingURL=profile_controller.js.map