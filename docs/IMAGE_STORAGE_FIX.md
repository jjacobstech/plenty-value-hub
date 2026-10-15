# Image Storage Path Fix for Production

## Problem
In production (Docker/cloud), image files are stored with random names but the database was storing different URLs than what was actually saved, causing ENOENT (file not found) errors:

```
ENOENT: no such file or directory, stat '/app/build/storage/uploads/profiles/25/cover_banner/006cdeff2e9f5338.jpg'
```

This happened because:
1. Frontend sent full URL to controller
2. Controller saved the full URL to database
3. In production, files are served differently (relative paths vs absolute URLs)
4. The app tried to access files at incorrect paths

## Solution
Store only the **storage key** (relative path) in the database, then resolve to full URLs on-demand.

### Changes Made

#### 1. Created ImageService
**File:** `app/services/image_service.ts`

Centralized image URL resolution logic:
```typescript
// Resolve storage key to URL (handles both keys and full URLs)
await ImageService.getUrl(imageKey)

// Check if image exists
await ImageService.isAccessible(imageKey)
```

#### 2. Updated ProfileController
**File:** `app/controllers/profile_controller.ts`

**Before:**
```typescript
const url = await drive.use(storageDisk).getUrl(key)
user.businessLogo = url  // ❌ Saves full URL
```

**After:**
```typescript
user.businessLogo = key  // ✅ Save only the key
await user.save()
const url = await drive.use(storageDisk).getUrl(key)
return response.json({ success: true, url, key })  // Return URL for frontend display

// When returning user data:
const userData = user.serialize()
userData.businessLogo = await ImageService.getUrl(user.businessLogo)  // Resolve on-demand
```

#### 3. Updated UploadController
**File:** `app/controllers/upload_controller.ts`

Ensure consistent URL handling across all upload methods:
- Product image upload
- Product gallery upload
- Profile image upload
- Admin image upload
- Video upload
- Document upload

All now return both `url` (for frontend) and `key` (for database storage).

#### 4. Updated User Model
**File:** `app/models/user.ts`

Added `ImageService` integration for future serialization needs.

## Data Flow

### Upload Process
```
1. Frontend selects file
2. File uploaded to /api/uploads/profile-image
3. File stored: /app/build/storage/uploads/profiles/25/cover_banner/006cdeff2e9f5338.jpg
4. Storage key: "profiles/25/cover_banner/006cdeff2e9f5338.jpg"
5. Database stores: "profiles/25/cover_banner/006cdeff2e9f5338.jpg" (KEY only)
6. Response returns: full URL for frontend display
```

### Retrieval Process
```
1. API returns user data with storage keys (not URLs)
2. Controller resolves keys to URLs using ImageService.getUrl()
3. Frontend receives full URLs ready to display
4. If storage path changes (local → S3, etc.), update is centralized
```

## Database Migration (Optional)

If you have existing full URLs stored, you can migrate them:

```typescript
// Migration to clean up existing URLs
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Convert full URLs back to storage keys
    // This assumes URLs follow pattern: /storage/uploads/...
    this.schema.raw(`
      UPDATE users 
      SET profile_picture = SUBSTRING(profile_picture, POSITION('/storage' IN profile_picture) + 8)
      WHERE profile_picture LIKE '%/storage%'
    `)
  }

  async down() {
    // Revert if needed
  }
}
```

## Key Benefits

✅ **Consistent storage** - Database stores only storage keys, not full URLs  
✅ **Flexible URLs** - Change storage backend (local → S3) without updating DB  
✅ **Error prevention** - No mismatches between stored path and actual file location  
✅ **Centralized logic** - All URL resolution in one service  
✅ **Production ready** - Works with Docker, cloud storage, CDNs  

## Testing

### Local Testing
```bash
# Upload a profile image
curl -X POST http://localhost:3333/api/uploads/profile-image \
  -F "image=@test.jpg" \
  -F "type=business_logo"

# Check database
SELECT business_logo FROM users WHERE id = 25;
# Should return: "profiles/25/business_logo/0dbbd6cdc57f6233.jpg" (NOT full URL)

# Fetch user profile
GET http://localhost:3333/api/profile/vendor
# Response should include full URL resolved from the key
```

### Production Testing
Verify in production logs that:
1. No more ENOENT errors for profile images
2. Images display correctly in UI
3. Storage keys are stored in database (not full URLs)

## Future Improvements

1. **CDN Integration**: Prepend CDN URL in `ImageService.getUrl()`
2. **Image Optimization**: Resize/compress in upload controller
3. **Caching**: Cache resolved URLs for better performance
4. **Migration Tool**: Batch migrate existing URLs if needed
