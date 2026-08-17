import React, { useEffect, useState } from 'react'
import SEO from '@/components/SEO'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/api/http-client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Star, TrendingUp, ShoppingCart, Link2, ChevronRight, Loader2 } from 'lucide-react'
import { formatUSD } from '@/lib/currency'
import PublicLayout from '@/components/layout/PublicLayout'

/* ------------------------------------------------------------------ */
/*  Types — these mirror exactly what PagesController.productDetail    */
/*  serializes. Numbers are numbers, nulls mean "no value". No         */
/*  normalisation happens here.                                        */
/* ------------------------------------------------------------------ */

type ProductPayload = {
  id: number
  name: string
  slug: string | null
  description: string | null
  shortDescription: string | null
  category: string
  productType: string | null

  price: number
  salePrice: number | null
  onSale: boolean
  effectivePrice: number
  discountPercent: number

  commissionRate: number
  gravityScore: number
  rating: number
  reviewCount: number
  avgEarningsPerSale: number | null
  conversionRate: number | null
  refundRate: number

  imageUrl: string | null
  vendorName: string | null
  billingCycle: string
  recurringBilling: boolean
}

type ReviewPayload = {
  id: number
  rating: number
  content: string
  reviewerName: string
  isVerifiedPurchase: boolean
  createdAt: string | null
}

type PaymentPayload = {
  providers: Array<{ key: string; label: string; description: string | null }>
  activeProvider: string | null
  checkoutAvailable: boolean
  currency: string
  currencySymbol: string
}

type ProductDetailProps = {
  product: ProductPayload
  reviews?: ReviewPayload[]
  payment?: PaymentPayload
}

const CATEGORY_LABELS: Record<string, string> = {
  health_fitness: 'Health & Fitness',
  business_investing: 'Business',
  software_saas: 'Software',
  ecommerce: 'E-Commerce',
  education: 'Education',
  fashion: 'Fashion',
  beauty: 'Beauty',
  home_garden: 'Home & Garden',
  technology: 'Technology',
  finance: 'Finance',
  digital_services: 'Digital Services',
  ai_tools: 'AI Tools',
  productivity: 'Productivity',
  lifestyle: 'Lifestyle',
}

const EMPTY_PAYMENT: PaymentPayload = {
  providers: [],
  activeProvider: null,
  checkoutAvailable: false,
  currency: 'USD',
  currencySymbol: '$',
}

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProductDetail({
  product,
  reviews = [],
  payment = EMPTY_PAYMENT,
}: ProductDetailProps) {
  const { auth } = usePage().props as any

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>(
    () => payment.activeProvider ?? payment.providers[0]?.key ?? ''
  )

  // Guard against an Inertia partial reload changing the provider list.
  useEffect(() => {
    if (!payment.providers.some((p) => p.key === selectedProvider)) {
      setSelectedProvider(payment.activeProvider ?? payment.providers[0]?.key ?? '')
    }
  }, [payment, selectedProvider])

  const checkoutAvailable = payment.checkoutAvailable && Boolean(selectedProvider)
  const needsEmail = !auth?.user
  const selectedProviderLabel = payment.providers.find((p) => p.key === selectedProvider)?.label

  const handlePurchase = async () => {
    if (!checkoutAvailable) {
      toast.error('Checkout is temporarily unavailable.')
      return
    }

    const email = auth?.user?.email ?? guestEmail.trim()
    if (!email || !isValidEmail(email)) {
      toast.error('Enter a valid email address to continue.')
      console.log('EMAIL: ', email)
      return
    }

    // Read at click time, not render time — safe under SSR.
    const affiliateLinkCode =
      typeof window !== 'undefined' ? sessionStorage.getItem('pv_ref') : null

    setPurchasing(true)
    try {
      const res = await apiClient.post('/api/payments/initialize', {
        productId: product.id,
        paymentProvider: selectedProvider,
        affiliateLinkCode,
        callbackUrl: window.location.href,
        email,
      })

      if (!res.data?.success) {
        toast.error(res.data?.error || 'Failed to process order. Please try again.')
        return
      }

      sessionStorage.removeItem('pv_ref')
      const redirectUrl =
        res.data.payment?.paymentUrl ??
        res.data.payment?.payment_url ??
        res.data.payment?.redirectUrl ??
        res.data.payment?.redirect_url

      if (redirectUrl) {
        toast.success('Redirecting to payment gateway...')
        window.location.href = redirectUrl
      } else {
        // Every remaining provider is redirect-based, so a missing URL means
        // the order exists but nobody has paid for it.
        const ref = res.data.order?.orderNumber ?? res.data.order?.order_number ?? ''
        toast.error(
          `Order ${ref} was created, but the payment page could not be opened. Please contact support.`
        )
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to process order. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return

    setSubmittingReview(true)
    try {
      await apiClient.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        content: reviewContent,
      })
      toast.success('Review submitted for approval')
      setReviewContent('')
      setReviewRating(5)
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const productDescription =
    product.shortDescription || product.description || `Buy ${product.name} on Plenty Value.`

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': productDescription,
    'image': product.imageUrl || undefined,
    'brand': product.vendorName ? { '@type': 'Brand', 'name': product.vendorName } : undefined,
    'offers': {
      '@type': 'Offer',
      'price': product.effectivePrice,
      'priceCurrency': payment.currency,
      'availability': 'https://schema.org/InStock',
      'url': typeof window !== 'undefined' ? window.location.href : '',
    },
    'aggregateRating':
      product.rating > 0 && product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            'ratingValue': product.rating,
            'reviewCount': product.reviewCount,
          }
        : undefined,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={product.name}
        description={productDescription}
        image={product.imageUrl || undefined}
        type="product"
        structuredData={productStructuredData}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/marketplace" className="hover:text-primary">
          Marketplace
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
              <span className="text-8xl font-display font-bold text-primary/15">
                {product.name?.[0]}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-3">
              {CATEGORY_LABELS[product.category] || product.category}
            </Badge>
            <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
            {product.vendorName && (
              <p className="text-muted-foreground">
                by <span className="font-medium text-foreground">{product.vendorName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= product.rating ? 'fill-primary text-primary' : 'text-border'}`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">({product.reviewCount})</span>
              </div>
            )}
            {product.gravityScore > 0 && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" /> Gravity: {product.gravityScore}
              </Badge>
            )}
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            {product.onSale ? (
              <>
                <span className="text-4xl font-bold">{formatUSD(product.effectivePrice)}</span>
                <span className="text-xl text-muted-foreground line-through">
                  {formatUSD(product.price)}
                </span>
                {product.discountPercent > 0 && (
                  <Badge className="bg-destructive">{product.discountPercent}% OFF</Badge>
                )}
              </>
            ) : (
              <span className="text-4xl font-bold">{formatUSD(product.price)}</span>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Commission</p>
              <p className="font-bold text-green-600">{product.commissionRate}%</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg EPC</p>
              <p className="font-bold">
                {product.avgEarningsPerSale !== null ? formatUSD(product.avgEarningsPerSale) : '—'}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Conv. Rate</p>
              <p className="font-bold">
                {product.conversionRate !== null ? `${product.conversionRate}%` : '—'}
              </p>
            </div>
          </div>

          {/* Guest email — gateways require one for the receipt */}
          {needsEmail && checkoutAvailable && (
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-email"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider block"
              >
                Email for receipt
              </label>
              <Input
                id="checkout-email"
                type="email"
                inputMode="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="underline hover:text-primary">
                  Log in
                </Link>{' '}
                to save this purchase to your orders.
              </p>
            </div>
          )}

          {/* Payment gateway selector */}
          {checkoutAvailable ? (
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Select payment gateway
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup">
                {payment.providers.map((prov) => {
                  const isSelected = selectedProvider === prov.key
                  return (
                    <button
                      key={prov.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedProvider(prov.key)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold capitalize">{prov.label}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-900">
                Checkout is temporarily unavailable for this product. Please check back shortly.
              </p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-base shadow-sm"
            onClick={handlePurchase}
            disabled={purchasing || !checkoutAvailable}
          >
            {purchasing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Initializing payment...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {selectedProviderLabel ? `Pay with ${selectedProviderLabel}` : 'Unavailable'}
              </>
            )}
          </Button>

          {product.shortDescription && (
            <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate Info</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6 prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed break-words">
                {product.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-6">
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to write one.
            </p>
          )}

          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-primary text-primary' : 'text-border'}`}
                    />
                  ))}
                  {review.isVerifiedPurchase && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{review.content}</p>
                <p className="text-xs text-muted-foreground mt-3">{review.reviewerName}</p>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    aria-label={`Rate ${s} out of 5`}
                  >
                    <Star
                      className={`w-6 h-6 cursor-pointer ${s <= reviewRating ? 'fill-primary text-primary' : 'text-border'}`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your experience..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
              <Button
                onClick={handleSubmitReview}
                className="bg-primary"
                disabled={submittingReview || !reviewContent.trim()}
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliate" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="text-2xl font-bold text-green-600">{product.commissionRate}%</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Avg Earnings/Sale</p>
                  <p className="text-2xl font-bold">
                    {product.avgEarningsPerSale !== null
                      ? formatUSD(product.avgEarningsPerSale)
                      : '—'}
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Refund Rate</p>
                  <p className="text-2xl font-bold">{product.refundRate}%</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-2xl font-bold capitalize">{product.productType || '—'}</p>
                </div>
              </div>
              <Link href="/register">
                <Button className="w-full bg-primary mt-4">
                  <Link2 className="w-4 h-4 mr-2" /> Become an Affiliate to Promote
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

ProductDetail.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
