import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/shared/ProductCard'
import { cn } from '@/lib/utils'
import PublicLayout from '@/components/layout/PublicLayout'

const CATEGORIES = [
  { label: 'All Categories', value: 'all' },
  { label: 'Health & Fitness', value: 'health_fitness' },
  { label: 'Business & Investing', value: 'business_investing' },
  { label: 'Software & SaaS', value: 'software_saas' },
  { label: 'Education', value: 'education' },
  { label: 'Technology', value: 'technology' },
  { label: 'AI Tools', value: 'ai_tools' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'E-Commerce', value: 'ecommerce' },
  { label: 'Finance', value: 'finance' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Home & Garden', value: 'home_garden' },
  { label: 'Digital Services', value: 'digital_services' },
]

const PRODUCT_TYPES = [
  { label: 'All Types', value: 'all' },
  { label: 'Digital', value: 'digital' },
  { label: 'Physical', value: 'physical' },
  { label: 'Service', value: 'service' },
]

type MarketplaceProps = {
  products: any[]
}

export default function Marketplace({ products = [] }: MarketplaceProps) {
  const urlParams = new URLSearchParams(window.location.search)
  const initialCategory = urlParams.get('category') || 'all'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [productType, setProductType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...products]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      )
    }
    if (category !== 'all') result = result.filter((p) => p.category === category)
    if (productType !== 'all') result = result.filter((p) => p.product_type === productType)

    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price))
        break
      case 'price_high':
        result.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price))
        break
      case 'popular':
        result.sort((a, b) => (b.gravity_score || 0) - (a.gravity_score || 0))
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'commission':
        result.sort((a, b) => (b.commission_rate || 0) - (a.commission_rate || 0))
        break
      default:
        break
    }
    return result
  }, [products, search, category, productType, sortBy])

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setProductType('all')
    setSortBy('newest')
  }

  const activeFilters = [category !== 'all', productType !== 'all', search].filter(Boolean).length

  // Count products per category
  const categoryCounts = useMemo(() => {
    const counts = {}
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [products])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: '#001845' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Marketplace
          </h1>
          <p className="text-slate-300 text-sm">Discover trusted products across all categories</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top bar: search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger className="w-full sm:w-40 h-11">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="commission">Highest Commission</SelectItem>
            </SelectContent>
          </Select>
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            className="sm:hidden h-11 gap-2"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <SlidersHorizontal className="w-4 h-4" /> Categories
          </Button>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={clearFilters}
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-6">
          {/* ── Sticky Category Sidebar ── */}
          <aside
            className={cn(
              'w-60 flex-shrink-0',
              'hidden md:block',
              mobileSidebarOpen &&
                '!block fixed inset-y-0 left-0 z-50 bg-white shadow-2xl w-72 overflow-y-auto pt-16 md:static md:shadow-none md:bg-transparent md:z-auto md:overflow-visible md:pt-0'
            )}
          >
            <div className="sticky top-20">
              <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b" style={{ backgroundColor: '#001845' }}>
                  <h3 className="text-sm font-semibold text-white">Categories</h3>
                </div>
                <div className="py-2">
                  {CATEGORIES.map((cat) => {
                    const count =
                      cat.value === 'all' ? products.length : categoryCounts[cat.value] || 0
                    const isSelected = category === cat.value
                    return (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setCategory(cat.value)
                          setMobileSidebarOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all',
                          isSelected
                            ? 'font-semibold border-l-2'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                        style={
                          isSelected
                            ? {
                                color: '#001845',
                                borderLeftColor: '#81C14B',
                                backgroundColor: '#001845' + '08',
                              }
                            : {}
                        }
                      >
                        <span>{cat.label}</span>
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full',
                            isSelected ? 'text-white' : 'text-muted-foreground bg-muted'
                          )}
                          style={isSelected ? { backgroundColor: '#81C14B' } : {}}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile sidebar backdrop */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* ── Product Grid ── */}
          <div className="flex-1 min-w-0">
            {/* Active filters + result count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  {`${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
                </p>
                {category !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="text-xs gap-1 cursor-pointer"
                    onClick={() => setCategory('all')}
                  >
                    {CATEGORIES.find((c) => c.value === category)?.label}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {productType !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="text-xs gap-1 cursor-pointer"
                    onClick={() => setProductType('all')}
                  >
                    {PRODUCT_TYPES.find((t) => t.value === productType)?.label}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} showCommission />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

Marketplace.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
