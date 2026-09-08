import DashboardLayout from '@/components/layout/DashboardLayout'
import ImageUploadField from '@/components/ImageUploadField'
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Package, AlertCircle, Images, X, Loader2 } from 'lucide-react'
import { formatUSD as formatNGN, getActiveCurrency } from '@/lib/currency'
import { toast } from 'sonner'
import api from '@/api/http-client'
import { validateProduct, getFieldError, hasFieldError } from '@/validators/productValidator'

const MAX_GALLERY_IMAGES = 5

const CATEGORIES = [
  { label: 'Health & Fitness', value: 'health_fitness' },
  { label: 'Business & Investing', value: 'business_investing' },
  { label: 'Software & SaaS', value: 'software_saas' },
  { label: 'Education', value: 'education' },
  { label: 'Technology', value: 'technology' },
  { label: 'AI Tools', value: 'ai_tools' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Home & Garden', value: 'home_garden' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'E-Commerce', value: 'ecommerce' },
  { label: 'Finance', value: 'finance' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Digital Services', value: 'digital_services' },
]

const defaultForm = {
  name: '',
  description: '',
  shortDescription: '',
  category: 'technology',
  productType: 'digital',
  price: '',
  salePrice: '',
  commissionRate: '30',
  imageUrl: '',
  galleryUrls: [] as string[],
  digitalAssetUrl: '',
  digitalAssetName: '',
  recurringBilling: false,
  billingCycle: 'one_time',
  unitCount: '',
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-500',
}

// Postgres numeric/decimal columns serialise as strings ("30.00"), so every
// numeric field has to be coerced before formatting or arithmetic.
const num = (val: unknown): number => {
  const n = typeof val === 'string' ? Number.parseFloat(val) : Number(val)
  return Number.isFinite(n) ? n : 0
}

type VendorProductsProps = {
  user: any
  products: any[]
  platformCommission?: number
}

// ---------------------------------------------------------------------------
// GalleryDropZone – single upload zone that accepts multiple files at once
// ---------------------------------------------------------------------------
interface GalleryDropZoneProps {
  currentCount: number
  max: number
  onUploaded: (urls: string[]) => void
}

function GalleryDropZone({ currentCount, max, onUploaded }: GalleryDropZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const ALLOWED = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  const MAX_MB = 10
  const remaining = max - currentCount

  const uploadFiles = async (files: File[]) => {
    // Slice to however many slots remain
    const toUpload = files.slice(0, remaining)
    if (toUpload.length === 0) return

    // Validate each file
    const invalid: string[] = []
    const valid: File[] = []
    for (const f of toUpload) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
      if (!ALLOWED.includes(ext)) {
        invalid.push(`"${f.name}" — unsupported type`)
        continue
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        invalid.push(`"${f.name}" — exceeds ${MAX_MB}MB`)
        continue
      }
      valid.push(f)
    }
    setErrors(invalid)

    if (valid.length === 0) return

    setUploading(true)
    setProgress({ done: 0, total: valid.length })

    const results: string[] = []
    for (const file of valid) {
      try {
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await api.post<{ success: boolean; url?: string; error?: string }>(
          '/api/uploads/product-image',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        if (data.success && data.url) {
          results.push(data.url)
        } else {
          setErrors((prev) => [...prev, `"${file.name}" — ${data.error ?? 'upload failed'}`])
        }
      } catch (err: any) {
        const msg = err.response?.data?.error ?? err.message ?? 'upload failed'
        setErrors((prev) => [...prev, `"${file.name}" — ${msg}`])
      }
      setProgress((p) => p && { done: p.done + 1, total: p.total })
    }

    if (results.length > 0) {
      onUploaded(results)
      toast.success(
        results.length === 1
          ? '1 gallery image uploaded'
          : `${results.length} gallery images uploaded`
      )
    }

    setUploading(false)
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) uploadFiles(files)
  }

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 transition-all cursor-pointer text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.map((t) => `.${t}`).join(',')}
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) uploadFiles(files)
          }}
        />

        {uploading && progress ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-xs text-gray-600">
              Uploading {progress.done}/{progress.total}…
            </p>
            <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Images className="w-7 h-7 text-gray-400" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              Click or drag &amp; drop to upload gallery images
            </p>
            <p className="text-xs text-gray-500">
              {ALLOWED.join(', ').toUpperCase()} · Max {MAX_MB}MB each ·{' '}
              {remaining} slot{remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {e}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VendorProducts(props: VendorProductsProps) {
  const { user, products: initialProducts, platformCommission = 10 } = props
  const [products, setProducts] = useState(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [serverErrors, setServerErrors] = useState<Record<string, string> | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setValidationErrors(null)
    setServerErrors(null)

    // Validate form data on frontend
    const validation = validateProduct(form, editId ? true : false)
    if (!validation.success) {
      setValidationErrors(validation.errors)
      // Show toast with first error
      const firstError = Object.values(validation.errors || {})[0]?.[0]
      if (firstError) {
        toast.error('Validation Error', { description: firstError })
      }
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        productType: form.productType,
        price: Number.parseFloat(form.price),
        commissionRate: Number.parseFloat(form.commissionRate),
        // optional: omit entirely rather than sending '' or null
        ...(form.description.trim() && { description: form.description.trim() }),
        ...(form.shortDescription.trim() && { shortDescription: form.shortDescription.trim() }),
        ...(form.salePrice && { salePrice: Number.parseFloat(form.salePrice) }),
        ...(form.imageUrl && { imageUrl: form.imageUrl }),
        ...(form.galleryUrls.length > 0 && { galleryUrls: form.galleryUrls }),
        ...(form.digitalAssetUrl && { digitalAssetUrl: form.digitalAssetUrl }),
        ...(form.digitalAssetName && { digitalAssetName: form.digitalAssetName }),
        ...(form.billingCycle && { billingCycle: form.billingCycle }),
        recurringBilling: form.recurringBilling,
        ...(form.unitCount !== '' && { unitCount: Number.parseInt(form.unitCount as string) }),
      }
      const url = editId ? `/api/products/${editId}` : '/api/products'
      const { data: response } = editId ? await api.put(url, payload) : await api.post(url, payload)

      // POST returns [{ success, message, data }] while GET returns a flat
      // product; unwrap whichever shape came back.
      const envelope = Array.isArray(response) ? response[0] : response
      const saved = envelope?.data ?? envelope

      if (editId) {
        setProducts((prev) => prev.map((p) => (p.id === editId ? saved : p)))
        toast.success('Product updated successfully')
      } else {
        setProducts((prev) => [...prev, saved])
        toast.success('Product submitted for review')
      }
      setShowForm(false)
      setEditId(null)
      setForm(defaultForm)
    } catch (err: any) {
      // Handle server validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const serverValidationErrors: Record<string, string> = {}
        const errors = err.response.data.errors

        // VineJS returns [{ field, message }]; other handlers return
        // { field: [message] }. Accept both.
        if (Array.isArray(errors)) {
          errors.forEach((item: any) => {
            if (item?.field) serverValidationErrors[item.field] = item.message
          })
        } else {
          Object.entries(errors).forEach(([field, messages]: [string, any]) => {
            serverValidationErrors[field] = Array.isArray(messages) ? messages[0] : String(messages)
          })
        }

        setServerErrors(serverValidationErrors)
        toast.error('Validation Error', {
          description: 'Please fix the errors below',
        })
      } else {
        toast.error('Failed to save product')
        console.error('Save error:', err)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product? This will archive it.')) return

    setSaving(true)
    try {
      // Archive the product instead of hard delete (soft delete)
      // This preserves referential integrity with orders
      await api.put(`/api/products/${id}`, { status: 'archived' })
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Product archived')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error?.response?.data?.error || 'Failed to archive product')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditId(product.id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      category: product.category || 'technology',
      productType: product.productType || 'digital',
      price: product.price != null ? String(num(product.price)) : '',
      salePrice: product.salePrice != null ? String(num(product.salePrice)) : '',
      commissionRate: product.commissionRate != null ? String(num(product.commissionRate)) : '30',
      imageUrl: product.imageUrl || '',
      galleryUrls: Array.isArray(product.galleryUrls) ? product.galleryUrls : [],
      digitalAssetUrl: product.digitalAssetUrl || '',
      digitalAssetName: product.digitalAssetName || '',
      recurringBilling: product.recurringBilling || false,
      billingCycle: product.billingCycle || 'one_time',
      unitCount: product.unitCount != null ? String(product.unitCount) : '',
    })
    setShowForm(true)
  }

  const approvedCount = products.filter((p) => p.status === 'approved').length
  const pendingCount = products.filter((p) => p.status === 'pending').length

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-[#81C14B]" />
              My Products
            </h1>
            <p className="text-muted-foreground text-sm">
              {approvedCount} active · {pendingCount} pending review
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditId(null)
              setForm(defaultForm)
            }}
            style={{ backgroundColor: '#001845' }}
            className="text-white hover:opacity-90 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Products', value: products.length, color: 'text-[#001845]' },
            { label: 'Approved', value: approvedCount, color: 'text-green-600' },
            { label: 'Pending Review', value: pendingCount, color: 'text-amber-600' },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent
            className="max-w-sm sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full"
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editId ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="rounded-sm p-1 opacity-70 hover:opacity-100 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>

            {/* Server/Validation Errors Summary */}
            {(validationErrors || serverErrors) &&
              Object.keys({ ...validationErrors, ...serverErrors }).length > 0 && (
                <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">
                      {Object.keys({ ...validationErrors, ...serverErrors }).length} error
                      {Object.keys({ ...validationErrors, ...serverErrors }).length === 1
                        ? ''
                        : 's'}{' '}
                      found
                    </p>
                    <ul className="text-xs text-red-700 mt-2 space-y-1">
                      {Object.entries({ ...validationErrors, ...serverErrors })
                        .slice(0, 3)
                        .map(([field, error]) => (
                          <li key={field} className="flex gap-2">
                            <span className="font-medium">{field}:</span>
                            <span>{Array.isArray(error) ? error[0] : error}</span>
                          </li>
                        ))}
                      {Object.keys({ ...validationErrors, ...serverErrors }).length > 3 && (
                        <li className="text-xs italic">
                          +{Object.keys({ ...validationErrors, ...serverErrors }).length - 3} more
                          errors
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

            <form onSubmit={handleSave} className="space-y-3 sm:space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5">
                {/* Full width fields */}
                <div>
                  <Label className="text-xs sm:text-sm md:text-base">Product Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value })
                      // Clear error for this field when user starts typing
                      if (validationErrors?.name) {
                        setValidationErrors({ ...validationErrors, name: undefined })
                      }
                    }}
                    required
                    placeholder="Enter product name"
                    className={`text-xs sm:text-sm md:text-base ${hasFieldError(validationErrors, 'name') || serverErrors?.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {(hasFieldError(validationErrors, 'name') || serverErrors?.name) && (
                    <p className="text-xs text-red-600 mt-1">
                      {getFieldError(validationErrors, 'name') || serverErrors?.name}
                    </p>
                  )}
                </div>

                {/* Two column grid on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                  <div>
                    <Label className="text-xs sm:text-sm md:text-base">Category *</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger className="text-xs sm:text-sm md:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm md:text-base">Product Type *</Label>
                    <Select
                      value={form.productType}
                      onValueChange={(v) => setForm({ ...form, productType: v })}
                    >
                      <SelectTrigger className="text-xs sm:text-sm md:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                  <div>
                    <Label className="text-xs sm:text-sm md:text-base">
                      Price ({getActiveCurrency()}) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      placeholder="e.g. 29.99"
                      className="text-xs sm:text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm md:text-base">
                      Sale Price ({getActiveCurrency()})
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                      placeholder="Optional"
                      className="text-xs sm:text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Commission rate */}
                <div>
                  <Label className="text-xs sm:text-sm md:text-base">Commission Rate (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="75"
                    value={form.commissionRate}
                    onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                    required
                    className="text-xs sm:text-sm md:text-base"
                  />
                  {form.price && form.commissionRate && (
                    <p className="text-xs text-green-600 mt-1">
                      Affiliates earn:{' '}
                      {formatNGN(
                        ((Number.parseFloat(form.price) || 0) *
                          (Number.parseFloat(form.commissionRate) || 0)) /
                          100
                      )}{' '}
                      per sale
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    The platform deducts {platformCommission}% from each sale before your payout.
                  </p>
                </div>

                {/* Unit count */}
                <div>
                  <Label className="text-xs sm:text-sm md:text-base">Unit Count / Stock Qty</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.unitCount as string}
                    onChange={(e) => setForm({ ...form, unitCount: e.target.value })}
                    placeholder="e.g. 100 (leave blank for unlimited)"
                    className="text-xs sm:text-sm md:text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For physical products or limited digital licenses. Leave blank for unlimited.
                  </p>
                </div>

                {/* Product Image Upload */}
                <div>
                  <ImageUploadField
                    label="Product Image"
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url || '' })}
                    endpoint="/api/uploads/product-image"
                    showPreview={true}
                    helpText="Upload a product image (JPG, PNG, WebP, GIF • Max 10MB)"
                    required={true}
                  />
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <div className="text-amber-600 font-semibold text-xs flex-shrink-0">⚠️</div>
                    <p className="text-xs text-amber-800">
                      <strong>Quality matters:</strong> Products with low-quality, blurry, or poorly formatted images may not be approved.
                      Please ensure your image is clear, well-lit, and at least 800×600px for best results.
                    </p>
                  </div>
                </div>

                {/* Gallery Images (up to MAX_GALLERY_IMAGES additional images) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-xs sm:text-sm md:text-base">
                      Gallery Images{' '}
                      <span className="text-muted-foreground font-normal">
                        ({form.galleryUrls.length}/{MAX_GALLERY_IMAGES})
                      </span>
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Additional product photos shown in the product detail gallery. Drop multiple
                    files at once or click to select.
                  </p>

                  {/* Multi-file drop zone */}
                  {form.galleryUrls.length < MAX_GALLERY_IMAGES && (
                    <GalleryDropZone
                      currentCount={form.galleryUrls.length}
                      max={MAX_GALLERY_IMAGES}
                      onUploaded={(urls) =>
                        setForm((prev) => ({
                          ...prev,
                          galleryUrls: [...prev.galleryUrls, ...urls].slice(0, MAX_GALLERY_IMAGES),
                        }))
                      }
                    />
                  )}

                  {/* Thumbnail strip */}
                  {form.galleryUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {form.galleryUrls.map((url, idx) => (
                        <div key={idx} className="relative group w-20 h-20 flex-shrink-0">
                          <img
                            src={url}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            title="Remove"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                galleryUrls: prev.galleryUrls.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-0.5 left-0.5 bg-black/50 text-white text-[10px] rounded px-1">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Digital Product Asset Upload (for digital products) */}
                {form.productType === 'digital' && (
                  <div className="space-y-2 border border-dashed border-primary/40 p-4 rounded-lg bg-primary/5">
                    <Label className="text-xs sm:text-sm md:text-base font-semibold text-primary">
                      Original Digital Product Asset *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Upload the digital file (PDF, ZIP, MP4, MP3, EPUB, etc.) that buyers receive
                      upon purchasing this product.
                    </p>
                    <ImageUploadField
                      label="Digital Asset File"
                      value={form.digitalAssetUrl}
                      onChange={(url) =>
                        setForm({
                          ...form,
                          digitalAssetUrl: url || '',
                          digitalAssetName: url ? form.digitalAssetName || 'Product File' : '',
                        })
                      }
                      endpoint="/api/uploads/digital-asset"
                      allowedTypes={[
                        'pdf',
                        'zip',
                        'rar',
                        'mp4',
                        'mp3',
                        'epub',
                        'doc',
                        'docx',
                        'png',
                        'jpg',
                        'jpeg',
                      ]}
                      maxSizeMB={200}
                      showPreview={false}
                    />
                    {form.digitalAssetUrl && (
                      <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center justify-between">
                        <span>Asset attached: {form.digitalAssetName || form.digitalAssetUrl}</span>
                        <a
                          href={form.digitalAssetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline text-green-800 ml-2"
                        >
                          Preview File
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Billing */}
                <div>
                  <Label className="text-xs sm:text-sm md:text-base">Billing *</Label>
                  <Select
                    value={form.billingCycle}
                    onValueChange={(v) => setForm({ ...form, billingCycle: v })}
                  >
                    <SelectTrigger className="text-xs sm:text-sm md:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Descriptions - Full width */}
                <div>
                  <Label className="text-xs sm:text-sm md:text-base">Short Description *</Label>
                  <Input
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Brief product tagline"
                    className="text-xs sm:text-sm md:text-base"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm md:text-base">Full Description *</Label>
                  <Textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detailed product description..."
                    className="text-xs sm:text-sm md:text-base resize-none"
                    required
                  />
                </div>
              </div>

              {/* Buttons - Responsive */}
              <div className="flex flex-col-reverse xs:flex-row gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 md:pt-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="text-xs sm:text-sm md:text-base w-full xs:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  style={{ backgroundColor: '#001845' }}
                  className="text-white text-xs sm:text-sm md:text-base w-full xs:w-auto hover:opacity-90"
                >
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Submit for Approval'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs sm:text-sm md:text-base">
                      <TableHead className="min-w-[150px] sm:min-w-[200px]">Product</TableHead>
                      <TableHead className="min-w-[80px] sm:min-w-[100px]">
                        Price ({getActiveCurrency()})
                      </TableHead>
                      <TableHead className="min-w-[80px] sm:min-w-[100px]">Commission</TableHead>
                      <TableHead className="min-w-[60px] sm:min-w-[80px]">Units</TableHead>
                      <TableHead className="min-w-[80px] sm:min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[60px] sm:min-w-[80px]">Sales</TableHead>
                      <TableHead className="min-w-[80px] sm:min-w-[120px]">
                        Revenue ({getActiveCurrency()})
                      </TableHead>
                      <TableHead className="min-w-[60px] sm:min-w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow
                        key={p.id}
                        className="text-xs sm:text-sm md:text-base hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            {p.imageUrl && (
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm md:text-base truncate">
                                {p.name}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize truncate">
                                {p.productType}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">
                          {formatNGN(num(p.price))}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-semibold text-xs sm:text-sm md:text-base">
                            {num(p.commissionRate)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.unitCount != null ? (
                            <span
                              className={`font-medium ${p.unitCount === 0 ? 'text-red-600' : 'text-slate-700'}`}
                            >
                              {p.unitCount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">∞</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium inline-block ${
                              statusStyles[p.status] ?? 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
                          {num(p.totalSales)}
                        </TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
                          {formatNGN(num(p.totalRevenue))}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-0.5 sm:gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(p)}
                              className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10"
                            >
                              <Pencil className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(p.id)}
                              className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 md:py-16 px-4">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3">
                  No products yet. Add your first listing!
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  style={{ backgroundColor: '#001845' }}
                  className="text-white text-xs sm:text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
