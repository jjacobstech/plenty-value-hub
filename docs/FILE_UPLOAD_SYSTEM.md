# File Upload System Documentation

**Date:** August 12, 2026  
**Status:** ✅ Complete & Production Ready  
**Version:** 1.0

---

## 📋 Overview

Plenty Value Hub uses a unified, file-based upload system for all media files (images, videos, documents). The system is built on:

- **Unified UploadController** - Single controller handling all file uploads
- **Multiple storage backends** - Local filesystem or S3/MinIO (configurable via `.env`)
- **Reusable ImageUploadField Component** - React component for easy integration into forms
- **Drag-and-drop support** - User-friendly file uploads
- **Comprehensive validation** - File type, size, and security checks
- **Authentication & Authorization** - Role-based access control

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│              Upload System Architecture                  │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌────────┐ ┌─────────┐ ┌──────────┐
   │ Client │ │ Storage │ │ Database │
   │(React) │ │(FS/S3)  │ │ (URLs)   │
   └────────┘ └─────────┘ └──────────┘
        │          │          │
        └──────────┼──────────┘
                   │
        ┌──────────▼──────────┐
        │ UploadController    │
        │ - Product Images    │
        │ - Profile Images    │
        │ - Admin Images      │
        │ - Videos            │
        │ - Documents         │
        └─────────────────────┘
```

### Data Flow

```
User selects file
       ↓
ImageUploadField component (React)
       ↓
Validation (type, size)
       ↓
FormData created
       ↓
POST to /api/uploads/[type]
       ↓
UploadController validates & authenticates
       ↓
File stored to S3/Local storage
       ↓
URL generated
       ↓
JSON response: { success: true, url: "...", key: "..." }
       ↓
Form updated with URL
       ↓
User saves form (URL persisted to database)
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Storage Driver
DRIVE=s3                    # 's3' or 'fs' (filesystem)

# For S3/MinIO Storage
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=plenty-value-hub
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000

# For Local Filesystem
# No additional config needed - files stored in storage/uploads/
```

### File Size Limits

```typescript
// app/controllers/upload_controller.ts
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024 // 25MB
```

### Allowed File Types

```typescript
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const ALLOWED_VIDEO_TYPES = ['mp4', 'webm', 'mov', 'avi', 'mkv']
const ALLOWED_DOCUMENT_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
```

---

## 📡 API Endpoints

### 1. Upload Product Image

**Endpoint:** `POST /api/uploads/product-image`  
**Auth Required:** Yes (Vendor or Admin)

**Request:**

```bash
curl -X POST http://localhost:3000/api/uploads/product-image \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

**Response:**

```json
{
  "success": true,
  "url": "https://storage.example.com/products/123/abc123def456.jpg",
  "key": "products/123/abc123def456.jpg"
}
```

**Storage Path:** `products/{userId}/{randomHash}.{ext}`

---

### 2. Upload Multiple Product Gallery Images

**Endpoint:** `POST /api/uploads/product-gallery`  
**Auth Required:** Yes (Vendor or Admin)

**Request:**

```bash
curl -X POST http://localhost:3000/api/uploads/product-gallery \
  -H "Authorization: Bearer <token>" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully uploaded 2 of 2 images",
  "results": [
    {
      "success": true,
      "url": "https://storage.example.com/products/123/gallery/abc123.jpg",
      "key": "products/123/gallery/abc123.jpg",
      "filename": "image1.jpg"
    },
    {
      "success": true,
      "url": "https://storage.example.com/products/123/gallery/def456.jpg",
      "key": "products/123/gallery/def456.jpg",
      "filename": "image2.jpg"
    }
  ]
}
```

**Storage Path:** `products/{userId}/gallery/{randomHash}.{ext}`

---

### 3. Upload Profile Image

**Endpoint:** `POST /api/uploads/profile-image`  
**Auth Required:** Yes (Any authenticated user)

**Request:**

```bash
curl -X POST http://localhost:3000/api/uploads/profile-image \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/logo.png" \
  -F "type=business_logo"
```

**Query Parameters:**

- `type` (required): One of `profile_picture`, `business_logo`, `cover_banner`

**Response:**

```json
{
  "success": true,
  "url": "https://storage.example.com/profiles/123/business_logo/xyz789.png",
  "key": "profiles/123/business_logo/xyz789.png"
}
```

**Storage Path:** `profiles/{userId}/{type}/{randomHash}.{ext}`

---

### 4. Upload Admin/Site Image

**Endpoint:** `POST /api/uploads/admin-image`  
**Auth Required:** Yes (Admin only)

**Request:**

```bash
curl -X POST http://localhost:3000/api/uploads/admin-image \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/banner.jpg" \
  -F "type=hero_banner"
```

**Query Parameters:**

- `type` (optional): Image category (e.g., `hero_banner`, `blog_featured`, etc.)

**Response:**

```json
{
  "success": true,
  "url": "https://storage.example.com/admin/hero_banner/qwe456.jpg",
  "key": "admin/hero_banner/qwe456.jpg"
}
```

**Storage Path:** `admin/{type}/{randomHash}.{ext}`

---

### 5. Upload Video

**Endpoint:** `POST /api/uploads/video`  
**Auth Required:** Yes (Admin only)

**Request:**

```bash
curl -X POST http://localhost:3000/api/uploads/video \
  -H "Authorization: Bearer <token>" \
  -F "video=@/path/to/video.mp4"
```

**Response:**

```json
{
  "success": true,
  "url": "https://storage.example.com/videos/abc123def456.mp4",
  "key": "videos/abc123def456.mp4"
}
```

**Storage Path:** `videos/{randomHash}.{ext}`

---

### 6. Upload Document

**Endpoint:** `POST /api/uploads/document`  
**Auth Required:** Yes (Any authenticated user)

**Request:**

```bash
curl -X POST http://localhost:3000/api/uploads/document \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/file.pdf"
```

**Response:**

```json
{
  "success": true,
  "url": "https://storage.example.com/documents/user/123/abc123def456.pdf",
  "key": "documents/user/123/abc123def456.pdf",
  "filename": "file.pdf"
}
```

**Storage Path:** `documents/{user|admin}/{userId}/{randomHash}.{ext}`

---

### 7. Generic File Upload

**Endpoint:** `POST /api/uploads/file`  
**Auth Required:** Yes (Any authenticated user)

**Request:**

```bash
curl -X POST http://localhost:3000/api/uploads/file \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file" \
  -F "type=image"
```

**Query Parameters:**

- `type` (optional): One of `image`, `video`, `document` (routes to appropriate endpoint)

---

## 🎨 React Component: ImageUploadField

### Installation

The component is located at `inertia/components/ImageUploadField.tsx` and is ready to use.

### Basic Usage

```typescript
import ImageUploadField from '@/components/ImageUploadField'
import { useState } from 'react'

export default function MyForm() {
  const [imageUrl, setImageUrl] = useState('')

  return (
    <form>
      <ImageUploadField
        label="Product Image"
        value={imageUrl}
        onChange={setImageUrl}
        endpoint="/api/uploads/product-image"
        required
      />

      <button type="submit">Save</button>
    </form>
  )
}
```

### Props

```typescript
interface ImageUploadFieldProps {
  // Label displayed above the field
  label: string

  // Current image URL
  value?: string | null

  // Callback when URL changes
  onChange: (url: string | null) => void

  // API endpoint for upload
  // Options: '/api/uploads/product-image', '/api/uploads/profile-image', etc.
  endpoint: string

  // Additional form data to send with upload (optional)
  formDataExtra?: Record<string, string>

  // Show image preview below upload area (default: true)
  showPreview?: boolean

  // CSS class for styling (optional)
  className?: string

  // Disable the field
  disabled?: boolean

  // Make field required
  required?: boolean

  // Help text displayed below field
  helpText?: string

  // Maximum file size in MB (default: 10)
  maxSizeMB?: number

  // Allowed file extensions (default: ['jpg', 'jpeg', 'png', 'webp', 'gif'])
  allowedTypes?: string[]
}
```

### Features

✅ **Drag and drop** - Users can drag files directly onto the field  
✅ **File validation** - Type and size validation before upload  
✅ **Upload progress** - Loading indicator during upload  
✅ **Preview** - Image preview shown after upload  
✅ **Error handling** - Toast notifications for errors  
✅ **Clear button** - Easy removal of selected image  
✅ **URL fallback** - Alternative text input for pasting URLs  
✅ **Responsive** - Works on mobile and desktop

### Advanced Usage

```typescript
<ImageUploadField
  label="Business Logo"
  value={form.businessLogo}
  onChange={(url) => setForm({ ...form, businessLogo: url || '' })}
  endpoint="/api/uploads/profile-image"
  formDataExtra={{ type: 'business_logo' }}
  showPreview={true}
  maxSizeMB={5}
  allowedTypes={['png', 'jpg', 'jpeg']}
  helpText="PNG or JPG, max 5MB"
  required
/>
```

---

## 📝 Usage Examples

### Product Image Upload

**Component:** `inertia/pages/vendor/VendorProducts.tsx`

```typescript
<ImageUploadField
  label="Product Image"
  value={form.image_url}
  onChange={(url) => setForm({ ...form, image_url: url || '' })}
  endpoint="/api/uploads/product-image"
  showPreview={true}
  helpText="Upload a product image (JPG, PNG, WebP, GIF • Max 10MB)"
/>
```

### Profile Image Upload

**Component:** `inertia/pages/vendor/VendorProfile.tsx`

```typescript
<ImageUploadField
  label=""
  value={form.businessLogo}
  onChange={(url) => setForm({ ...form, businessLogo: url || '' })}
  endpoint="/api/uploads/profile-image"
  formDataExtra={{ type: 'business_logo' }}
  showPreview={false}
/>
```

### Admin Image Upload

**Component:** `inertia/pages/admin/AdminHeroBanner.tsx`

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setUploading(true)
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', 'hero_banner')

    const res = await axios.post('/api/uploads/admin-image', formData)
    setPreviewUrl(res.data.url)
  } catch (err) {
    toast.error('Upload failed')
  } finally {
    setUploading(false)
  }
}
```

---

## 🔐 Security

### File Type Validation

- All file extensions are validated on both client and server
- MIME type checking on server
- File content validation (not just extension)

### File Size Limits

- Images: 10MB max
- Videos: 100MB max
- Documents: 25MB max
- Configurable in controller

### Storage Path Isolation

- Files stored with random hashes to prevent path traversal
- User ID included in path for ownership tracking
- Unique filenames prevent overwriting

### Authentication & Authorization

```typescript
// All endpoints require authentication
if (!user) {
  return response.unauthorized({ error: 'Authentication required' })
}

// Role-based access
if (user.role !== 'vendor' && user.role !== 'admin') {
  return response.forbidden({ error: 'Insufficient permissions' })
}
```

### CORS & HTTPS

- All uploads use HTTPS in production
- CORS properly configured for cross-origin requests
- Signed URLs for S3 storage

---

## 🐛 Error Handling

### Common Errors

**No file provided**

```json
{ "error": "No image file provided" }
```

**File too large**

```json
{ "error": "File size must be less than 10MB (current: 25.5MB)" }
```

**Invalid file type**

```json
{ "error": "File type must be one of: jpg, jpeg, png, webp, gif" }
```

**Upload failed**

```json
{ "error": "Failed to upload image" }
```

**Unauthorized**

```json
{ "error": "Authentication required" }
```

**Forbidden**

```json
{ "error": "Only vendors and admins can upload product images" }
```

---

## 📊 Storage Backends

### Local Filesystem

**Configuration:**

```typescript
// config/drive.ts
fs: services.fs({
  location: new URL('../storage/uploads', import.meta.url),
  visibility: 'public',
  serveFiles: true,
  routeBasePath: '/uploads',
})
```

**Files stored at:** `storage/uploads/`  
**Access via:** `http://localhost:3000/uploads/...`

### S3/MinIO

**Configuration:**

```typescript
// config/drive.ts
s3: services.s3({
  credentials: {
    accessKeyId: env.get('S3_ACCESS_KEY'),
    secretAccessKey: env.get('S3_SECRET_KEY'),
  },
  region: env.get('S3_REGION'),
  bucket: env.get('S3_BUCKET'),
  endpoint: env.get('S3_ENDPOINT'),
  forcePathStyle: true,
  visibility: 'public',
})
```

**Environment variables:**

```bash
DRIVE=s3
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=plenty-value-hub
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
```

**Access via:** `http://s3-endpoint/bucket/path/to/file`

---

## 🧪 Testing

### Test File Upload

```bash
# Create a test image
convert -size 100x100 xc:blue test.jpg

# Upload to product endpoint
curl -X POST http://localhost:3000/api/uploads/product-image \
  -H "Authorization: Bearer <your-token>" \
  -F "image=@test.jpg"

# Expected response
# {"success":true,"url":"...","key":"..."}
```

### Test with Different File Types

```bash
# Test invalid type
curl -X POST http://localhost:3000/api/uploads/product-image \
  -H "Authorization: Bearer <token>" \
  -F "image=@document.pdf"
# Expected: {"error":"File type must be one of: jpg, jpeg, png, webp, gif"}

# Test file too large
# (Create a 20MB file)
dd if=/dev/zero of=large.jpg bs=1024 count=20480

curl -X POST http://localhost:3000/api/uploads/product-image \
  -H "Authorization: Bearer <token>" \
  -F "image=@large.jpg"
# Expected: {"error":"File size must be less than 10MB..."}
```

---

## 📈 Performance

### Optimization Tips

1. **Image Optimization**
   - Consider WebP format for smaller file sizes
   - Resize large images before upload

2. **CDN Integration**
   - For S3, configure CloudFront or similar CDN
   - Enables caching and faster delivery

3. **Lazy Loading**
   - Implement lazy loading for image-heavy pages
   - Use intersection observer API

4. **Compression**
   - Enable gzip compression on server
   - Configure S3 to serve compressed files

---

## 🔄 Migration from URL-based

### Before (URL Input)

```typescript
<Input
  value={form.image_url}
  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
  placeholder="https://..."
/>
```

### After (File Upload)

```typescript
<ImageUploadField
  label="Product Image"
  value={form.image_url}
  onChange={(url) => setForm({ ...form, image_url: url || '' })}
  endpoint="/api/uploads/product-image"
/>
```

**Benefits:**

- File validation before upload
- No URL mistyping
- Better user experience
- Progress indication
- Error handling

---

## 📚 Related Files

| File                                      | Purpose                   |
| ----------------------------------------- | ------------------------- |
| `app/controllers/upload_controller.ts`    | Upload logic & validation |
| `inertia/components/ImageUploadField.tsx` | React component           |
| `config/drive.ts`                         | Storage configuration     |
| `start/routes.ts`                         | API route definitions     |
| `start/env.ts`                            | Environment variables     |
| `inertia/pages/vendor/VendorProducts.tsx` | Product upload example    |
| `inertia/pages/vendor/VendorProfile.tsx`  | Profile upload example    |
| `inertia/pages/admin/AdminHeroBanner.tsx` | Admin upload example      |

---

## ✅ Deployment Checklist

- [ ] Configure storage backend (S3 or local filesystem)
- [ ] Set environment variables for S3 credentials (if using S3)
- [ ] Verify file permissions on storage directory
- [ ] Test upload with each provider
- [ ] Configure CDN for S3 storage (optional)
- [ ] Set up backup for local filesystem storage
- [ ] Monitor disk usage and cleanup old files
- [ ] Update ALLOWED_IMAGE_TYPES if needed
- [ ] Adjust MAX_IMAGE_SIZE for your use case
- [ ] Test on production environment

---

## 🆘 Troubleshooting

### Upload Returns 401 Unauthorized

**Cause:** User not authenticated  
**Solution:** Ensure `Authorization: Bearer <token>` header is present

### Upload Returns 403 Forbidden

**Cause:** User role insufficient  
**Solution:** Check user role matches endpoint requirements

### Upload Returns 400 Bad Request

**Cause:** No file provided or invalid type  
**Solution:** Check file is being sent and is valid type

### File Uploaded but URL Returns 404

**Cause:** S3 credentials incorrect or bucket doesn't exist  
**Solution:** Verify S3 configuration and bucket access

### Disk Space Running Out

**Cause:** Too many uploads without cleanup  
**Solution:** Implement file retention policy and cleanup

### Images Not Loading from S3

**Cause:** CORS headers not configured  
**Solution:** Configure S3 CORS policy for your domain

---

**Status:** ✅ Production Ready  
**Last Updated:** August 12, 2026  
**Version:** 1.0
