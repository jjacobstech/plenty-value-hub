import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Link2, TrendingUp, Star, Copy, Check, Zap, ShoppingBag } from 'lucide-react'
import { formatUSD as formatNGN } from '@/lib/currency'
import { toast } from 'sonner'
import api from '@/api/http-client'

const CATEGORIES = [
  { label: 'All Categories', value: 'all' },
  { label: 'Health & Fitness', value: 'health_fitness' },
  { label: 'Business', value: 'business_investing' },
  { label: 'Software', value: 'software_saas' },
  { label: 'Education', value: 'education' },
  { label: 'Technology', value: 'technology' },
  { label: 'AI Tools', value: 'ai_tools' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Lifestyle', value: 'lifestyle' },
]

const CAT_LABELS = {
  health_fitness: 'Health & Fitness',
  business_investing: 'Business',
  software_saas: 'Software',
  education: 'Education',
  technology: 'Technology',
  ai_tools: 'AI Tools',
  fashion: 'Fashion',
  beauty: 'Beauty',
  home_garden: 'Home & Garden',
  lifestyle: 'Lifestyle',
  ecommerce: 'E-Commerce',
  finance: 'Finance',
  productivity: 'Productivity',
  digital_services: 'Digital Services',
}

type AffiliateProductsProps = {
  user: any
  products: any[]
}

export default function AffiliateProducts(props: AffiliateProductsProps) {
  const { user, products } = props
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('commission')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handlePromote = async (product: any) => {
    setIsCreating(true)
    try {
      const { data } = await api.post('/api/affiliate-links', { productId: product.id })
      toast.success('Affiliate link created! Ready to share.')
      setSelectedProduct({ ...product, link: data })
    } catch {
      toast.error('Failed to create affiliate link')
    } finally {
      setIsCreating(false)
    }
  }

  const filtered = useMemo(() => {
    let result = [...products]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.vendorName?.toLowerCase().includes(q)
      )
    }
    if (category !== 'all') result = result.filter((p) => p.category === category)
    if (sortBy === 'commission')
      result.sort((a, b) => (b.commissionRate || 0) - (a.commissionRate || 0))
    if (sortBy === 'gravity') result.sort((a, b) => (b.gravityScore || 0) - (a.gravityScore || 0))
    if (sortBy === 'price') result.sort((a, b) => b.price - a.price)
    if (sortBy === 'earnings')
      result.sort((a, b) => (b.avgEarningsPerSale || 0) - (a.avgEarningsPerSale || 0))
    return result
  }, [products, search, category, sortBy])

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied to clipboard!')
  }

  const commissionAmount = (product) => {
    if (!product.price || !product.commissionRate) return 0
    return (product.price * product.commissionRate) / 100
  }

  return (
    <DashboardLayout role="affiliate">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#81C14B]" />
            Product Marketplace
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse and promote high-converting products. Earn in USD.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products or sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48">
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commission">Highest Commission %</SelectItem>
              <SelectItem value="gravity">Most Popular</SelectItem>
              <SelectItem value="price">Highest Price</SelectItem>
              <SelectItem value="earnings">Highest EPS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </p>

        <div className="space-y-3">
          {filtered.map((product) => (
            <Card
              key={product.id}
              className="hover:border-[#81C14B]/40 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-muted shrink-0 overflow-hidden border">
                      {product.imageUrl && /^https?:\/\//.test(product.imageUrl) ? (
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#81C14B]/10">
                          <span className="font-display text-[#81C14B]/60 text-xl font-bold">
                            {product.name?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{product.name}</p>
                        {product.isFeatured && (
                          <span className="text-xs bg-[#81C14B]/10 text-[#81C14B] px-2 py-0.5 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                        {product.recurringBilling && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            Recurring
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.vendorName || 'Vendor'} ·{' '}
                        {CAT_LABELS[product.category] || product.category}
                      </p>
                      <p className="text-sm font-semibold mt-0.5">{formatNGN(product.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Commission</p>
                      <p className="font-bold text-[#81C14B] text-lg">{product.commissionRate}%</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-muted-foreground">You Earn</p>
                      <p className="font-bold text-green-600">
                        {formatNGN(commissionAmount(product))}
                      </p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-muted-foreground">Gravity</p>
                      <p className="font-bold">{product.gravityScore || 0}</p>
                    </div>
                    {product.rating && (
                      <div className="text-center hidden md:block">
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <p className="font-bold text-sm">{product.rating?.toFixed(1)}</p>
                        </div>
                      </div>
                    )}
                    <Button
                      style={{ backgroundColor: '#001845' }}
                      className="text-white hover:opacity-90"
                      size="sm"
                      onClick={() => handlePromote(product)}
                      disabled={isCreating || !user}
                    >
                      <Link2 className="w-4 h-4 mr-1.5" /> Promote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No products found. Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Link Created Dialog */}
        <Dialog open={!!selectedProduct?.link} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#81C14B]" />
                Your Affiliate Link is Ready!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-1">
                  🎉 You'll earn{' '}
                  <strong>{formatNGN(commissionAmount(selectedProduct || {}))}</strong> per sale (
                  {selectedProduct?.commission_rate}% commission)
                </p>
                <p className="text-xs text-green-600">
                  Share your link and start earning commissions today!
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  Your tracking link:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/ref/${selectedProduct?.link?.link_code}`}
                    className="font-mono text-xs bg-muted"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      handleCopy(
                        `${window.location.origin}/ref/${selectedProduct?.link?.link_code}`
                      )
                    }
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Promote via social media, WhatsApp, email, or your website. Every conversion earns
                you a commission!
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
