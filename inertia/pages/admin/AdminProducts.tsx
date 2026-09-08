import DashboardLayout from '@/components/layout/DashboardLayout'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, CheckCircle, XCircle, Star, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/api/http-client'
import { getActiveCurrencySymbol, formatUSD } from '@/lib/currency'

const CATEGORY_LABELS: Record<string, string> = {
  health_fitness: 'Health',
  business_investing: 'Business',
  software_saas: 'Software',
  ecommerce: 'E-Commerce',
  education: 'Education',
  fashion: 'Fashion',
  beauty: 'Beauty',
  home_garden: 'Home',
  technology: 'Tech',
  finance: 'Finance',
  digital_services: 'Digital',
  ai_tools: 'AI',
  productivity: 'Productivity',
  lifestyle: 'Lifestyle',
}

export interface Product {
  id: number
  uuid: string | null // migration doesn't set notNullable — nullable until you add the create-hook we discussed

  name: string
  slug: string | null
  description: string | null
  shortDescription: string | null

  category:
    | 'health_fitness'
    | 'business_investing'
    | 'software_saas'
    | 'ecommerce'
    | 'education'
    | 'fashion'
    | 'beauty'
    | 'home_garden'
    | 'technology'
    | 'finance'
    | 'digital_services'
    | 'ai_tools'
    | 'productivity'
    | 'lifestyle'
  productType: 'digital' | 'physical' | 'service'

  price: string // decimal — keep as string, see prior note
  salePrice: string | null
  commissionRate: string

  vendorId: number | null // migration has no .notNullable()
  vendorName: string | null // migration column is .nullable()

  imageUrl: string | null
  galleryUrls: string[] | null

  status: 'pending' | 'approved' | 'rejected' | 'archived' | null // nullable in the model despite defaultTo('pending')

  gravityScore: number | null // integer, but model shows nullable
  avgEarningsPerSale: string | null // decimal
  conversionRate: string | null // decimal — was wrongly typed as number
  refundRate: string | null // decimal — was wrongly typed as number

  totalSales: number | null
  totalRevenue: string // decimal, non-null in model

  rating: string | null // decimal — was wrongly typed as number
  reviewCount: number | null

  isFeatured: boolean | null
  tags: string[] | null
  affiliateResources: unknown | null // model has this as `any` — see note below

  recurringBilling: boolean | null
  billingCycle: 'one_time' | 'monthly' | 'yearly' | null

  createdAt: string
  updatedAt: string | null // DateTime | null in the model

  digitalAssetUrl: string | null
  digitalAssetName: string | null
}

type AdminProductsProps = {
  products: Product[]
}

export default function AdminProducts(props: AdminProductsProps) {
  const [products, setProducts] = useState(props.products)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState<number | null>(null)
  const [currencySymbol] = useState(() => getActiveCurrencySymbol())
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)

  const updateProduct = async (id: number, data: Record<string, any>) => {
    setLoading(id)
    try {
      const endpoint = data.status ? `/api/products/${id}/approve` : `/api/products/${id}`
      const method = data.status ? 'put' : 'put'

      const response = method === 'put'
        ? await api.put(endpoint, data)
        : await api.put(endpoint, data)

      const updated = response.data.data || response.data
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
      toast.success('Product updated')
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error?.response?.data?.error || 'Failed to update product')
    } finally {
      setLoading(null)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product? This will archive it.')) return

    setLoading(id)
    try {
      // Archive the product instead of deleting it (soft delete)
      // This preserves referential integrity with orders
      await updateProduct(id, { status: 'archived' })
    } finally {
      setLoading(null)
    }
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusColors: Record<string, string> = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    archived: 'outline',
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage and moderate marketplace products</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.vendorName || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[p.category] || p.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatUSD(p.price, false, currencySymbol)}</TableCell>
                    <TableCell>{p.commissionRate}%</TableCell>
                    <TableCell className="text-sm">
                      {(p as any).unitCount != null ? (
                        <span className={`font-medium ${(p as any).unitCount === 0 ? 'text-red-600' : 'text-slate-700'}`}>
                          {(p as any).unitCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">∞</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={(statusColors[p.status!] as any) ?? 'secondary'}
                        className="text-xs capitalize"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateProduct(p.id, { is_featured: !p.isFeatured })}
                      >
                        <Star
                          className={`w-4 h-4 ${p.isFeatured ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-blue-600"
                          disabled={loading === p.id}
                          onClick={() => setPreviewProduct(p)}
                          title="Preview product"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 h-8 px-2"
                          disabled={loading === p.id}
                          onClick={() => updateProduct(p.id, { status: 'approved' })}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-8 px-2"
                          disabled={loading === p.id}
                          onClick={() => updateProduct(p.id, { status: 'rejected' })}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-8 px-2"
                          disabled={loading === p.id}
                          onClick={() => deleteProduct(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Product Preview Modal */}
      <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{previewProduct?.name}</DialogTitle>
          </DialogHeader>

          {previewProduct && (
            <div className="space-y-6">
              {/* Product Image */}
              {previewProduct.imageUrl && (
                <div className="w-full">
                  <h3 className="text-sm font-semibold mb-2">Product Image</h3>
                  <img
                    src={previewProduct.imageUrl}
                    alt={previewProduct.name}
                    className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p>
                  <p className="text-sm font-medium mt-1">{CATEGORY_LABELS[previewProduct.category] || previewProduct.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                  <p className="text-sm font-medium mt-1 capitalize">{previewProduct.productType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Price</p>
                  <p className="text-sm font-medium mt-1">{formatUSD(previewProduct.price, false, currencySymbol)}</p>
                </div>
                {previewProduct.salePrice && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Sale Price</p>
                    <p className="text-sm font-medium mt-1">{formatUSD(previewProduct.salePrice, false, currencySymbol)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Commission Rate</p>
                  <p className="text-sm font-medium mt-1">{previewProduct.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendor</p>
                  <p className="text-sm font-medium mt-1">{previewProduct.vendorName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className="text-sm font-medium mt-1">
                    <Badge variant={(statusColors[previewProduct.status!] as any) ?? 'secondary'} className="capitalize">
                      {previewProduct.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Sales</p>
                  <p className="text-sm font-medium mt-1">{previewProduct.totalSales || 0}</p>
                </div>
              </div>

              {/* Short Description */}
              {previewProduct.shortDescription && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Short Description</p>
                  <p className="text-sm mt-1 text-foreground">{previewProduct.shortDescription}</p>
                </div>
              )}

              {/* Full Description */}
              {previewProduct.description && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p>
                  <p className="text-sm mt-1 text-foreground whitespace-pre-wrap">{previewProduct.description}</p>
                </div>
              )}

              {/* Digital Asset Info */}
              {previewProduct.productType === 'digital' && previewProduct.digitalAssetUrl && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900">📥 Digital Asset</p>
                  <p className="text-sm text-blue-800 mt-1">{previewProduct.digitalAssetName || 'Digital Asset'}</p>
                  <a
                    href={previewProduct.digitalAssetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                  >
                    View/Download File
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    if (previewProduct) {
                      updateProduct(previewProduct.id, { status: 'approved' })
                      setPreviewProduct(null)
                    }
                  }}
                  disabled={loading === previewProduct?.id}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    if (previewProduct) {
                      updateProduct(previewProduct.id, { status: 'rejected' })
                      setPreviewProduct(null)
                    }
                  }}
                  disabled={loading === previewProduct?.id}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button variant="outline" onClick={() => setPreviewProduct(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
