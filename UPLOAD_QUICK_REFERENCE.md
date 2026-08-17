# File Upload System - Quick Reference

**Quick links to common tasks**

---

## 🚀 Using ImageUploadField in Your Forms

### Basic Example

```typescript
import ImageUploadField from '@/components/ImageUploadField'
import { useState } from 'react'

export function MyComponent() {
  const [imageUrl, setImageUrl] = useState('')

  return (
    <ImageUploadField
      label="My Image"
      value={imageUrl}
      onChange={setImageUrl}
      endpoint="/api/uploads/product-image"
    />
  )
}
```

### With More Options

```typescript
<ImageUploadField
  label="Product Image"
  value={imageUrl}
  onChange={setImageUrl}
  endpoint="/api/uploads/product-image"
  showPreview={true}
  maxSizeMB={5}
  allowedTypes={['jpg', 'png', 'webp']}
  helpText="JPG, PNG, or WebP • Max 5MB"
  required
/>
```

---

## 📡 API Endpoints

| Purpose         | Endpoint                            | Auth         |
| --------------- | ----------------------------------- | ------------ |
| Product image   | `POST /api/uploads/product-image`   | Vendor/Admin |
| Product gallery | `POST /api/uploads/product-gallery` | Vendor/Admin |
| Profile image   | `POST /api/uploads/profile-image`   | Any user     |
| Admin image     | `POST /api/uploads/admin-image`     | Admin        |
| Video           | `POST /api/uploads/video`           | Admin        |
| Document        | `POST /api/uploads/document`        | Any user     |

---

## 🧪 Test Uploads

### Product Image

```bash
curl -X POST http://localhost:3000/api/uploads/product-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@image.jpg"
```

### Profile Image

```bash
curl -X POST http://localhost:3000/api/uploads/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@logo.png" \
  -F "type=business_logo"
```

### Gallery Images

```bash
curl -X POST http://localhost:3000/api/uploads/product-gallery \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@img1.jpg" \
  -F "images=@img2.jpg"
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Use local storage
DRIVE=fs

# Or use S3/MinIO
DRIVE=s3
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=plenty-value-hub
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
```

### File Limits

- Images: 10MB max
- Videos: 100MB max
- Documents: 25MB max
- Allowed image types: jpg, jpeg, png, webp, gif

---

## 🎨 Component Props

```typescript
{
  label: string                    // Required: Field label
  value?: string | null            // Current image URL
  onChange: (url: string | null)   // Called when URL changes
  endpoint: string                 // Required: Upload API endpoint
  formDataExtra?: object           // Extra form fields
  showPreview?: boolean            // Show image preview (default: true)
  disabled?: boolean               // Disable field
  required?: boolean               // Mark as required
  helpText?: string                // Help text below field
  maxSizeMB?: number              // Max file size in MB (default: 10)
  allowedTypes?: string[]         // Allowed extensions (default: common images)
}
```

---

## 📄 Examples in Codebase

| File                                      | Component      | Endpoint                     |
| ----------------------------------------- | -------------- | ---------------------------- |
| `inertia/pages/vendor/VendorProducts.tsx` | Product form   | `/api/uploads/product-image` |
| `inertia/pages/vendor/VendorProfile.tsx`  | Vendor profile | `/api/uploads/profile-image` |
| `inertia/pages/admin/AdminHeroBanner.tsx` | Admin banner   | `/api/uploads/admin-image`   |

---

## ✅ Response Format

```json
{
  "success": true,
  "url": "https://storage.example.com/products/123/abc123.jpg",
  "key": "products/123/abc123.jpg"
}
```

---

## ❌ Error Responses

```json
{
  "error": "File size must be less than 10MB"
}
```

Common errors:

- `"No image file provided"`
- `"File type must be one of: jpg, jpeg, png, webp, gif"`
- `"Authentication required"`
- `"Only vendors and admins can upload product images"`

---

## 🔑 Key Files

- **Controller:** `app/controllers/upload_controller.ts`
- **Component:** `inertia/components/ImageUploadField.tsx`
- **Routes:** `start/routes.ts` (search for `/api/uploads/`)
- **Config:** `config/drive.ts`
- **Full Docs:** `FILE_UPLOAD_SYSTEM.md`

---

## 💡 Tips

1. **Always include auth token** in upload requests
2. **Use appropriate endpoint** for your use case
3. **Test with different file sizes** to ensure limits work
4. **Check storage backend** is configured correctly
5. **Monitor disk/S3 usage** for production

---

**Need help?** See `FILE_UPLOAD_SYSTEM.md` for complete documentation.
