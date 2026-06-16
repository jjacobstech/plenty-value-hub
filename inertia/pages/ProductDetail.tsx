import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/http-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, TrendingUp, ArrowLeft, ShoppingCart, Link2, Shield, Package, BarChart3, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUSD } from '@/lib/currency';
import PublicLayout from '@/components/layout/PublicLayout';

const CATEGORY_LABELS = {
  health_fitness: 'Health & Fitness', business_investing: 'Business', software_saas: 'Software',
  ecommerce: 'E-Commerce', education: 'Education', fashion: 'Fashion', beauty: 'Beauty',
  home_garden: 'Home & Garden', technology: 'Technology', finance: 'Finance',
  digital_services: 'Digital Services', ai_tools: 'AI Tools', productivity: 'Productivity', lifestyle: 'Lifestyle',
};

type ProductDetailProps = {
  product: any
  reviews: any[]
}

export default function ProductDetail({ product, reviews = [] }: ProductDetailProps) {
  const { auth } = usePage().props;
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  // Read affiliate link code from sessionStorage (set by trackAffiliateClick redirect)
  const affiliateLinkCode = sessionStorage.getItem('pv_ref') || null;

  const handlePurchase = async () => {
    if (!auth?.user) {
      window.location.href = `/auth/login?redirect=${window.location.pathname}`;
      return;
    }
    setPurchasing(true);
    try {
      const res = await apiClient.post('/orders', {
        product_id: product.id,
        affiliate_link_code: affiliateLinkCode,
      });
      if (res.success) {
        sessionStorage.removeItem('pv_ref');
        toast.success(`Order confirmed! #${res.order?.order_number}`);
      }
    } catch (error) {
      toast.error('Failed to process order. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return;
    try {
      await apiClient.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        content: reviewContent,
      });
      toast.success('Review submitted for approval');
      setReviewContent('');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground">Product not found</p>
        <Link href="/marketplace"><Button variant="outline" className="mt-4">Back to Marketplace</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/marketplace" className="hover:text-primary">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
              <span className="text-8xl font-display font-bold text-primary/15">{product.name?.[0]}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-3">{CATEGORY_LABELS[product.category]}</Badge>
            <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
            {product.vendor_name && (
              <p className="text-muted-foreground">by <span className="font-medium text-foreground">{product.vendor_name}</span></p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= product.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                ))}
                <span className="text-sm text-muted-foreground ml-1">({product.review_count || 0})</span>
              </div>
            )}
            {product.gravity_score > 0 && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" /> Gravity: {product.gravity_score}
              </Badge>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            {product.sale_price && product.sale_price < product.price ? (
              <>
                <span className="text-4xl font-bold">{formatUSD(product.sale_price)}</span>
                <span className="text-xl text-muted-foreground line-through">{formatUSD(product.price)}</span>
                <Badge className="bg-destructive">
                  {Math.round((1 - product.sale_price / product.price) * 100)}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-4xl font-bold">{formatUSD(product.price)}</span>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Commission</p>
              <p className="font-bold text-green-600">{product.commission_rate}%</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg EPC</p>
              <p className="font-bold">{product.avg_earnings_per_sale ? formatUSD(product.avg_earnings_per_sale) : '—'}</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Conv. Rate</p>
              <p className="font-bold">{product.conversion_rate || '—'}%</p>
            </div>
          </div>

          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-base" onClick={handlePurchase} disabled={purchasing}>
            {purchasing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</> : <><ShoppingCart className="w-5 h-5 mr-2" /> Purchase Now</>}
          </Button>

          {product.short_description && (
            <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
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
              <p className="whitespace-pre-wrap leading-relaxed">{product.description || 'No description available.'}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6 space-y-6">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                  ))}
                  {review.is_verified_purchase && <Badge variant="outline" className="text-xs">Verified</Badge>}
                </div>
                <p className="text-sm leading-relaxed">{review.content}</p>
                <p className="text-xs text-muted-foreground mt-3">{review.reviewer_name || 'Anonymous'}</p>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader><CardTitle className="text-lg">Write a Review</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`w-6 h-6 cursor-pointer ${s <= reviewRating ? 'fill-primary text-primary' : 'text-border'}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder="Share your experience..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} />
              <Button onClick={handleSubmitReview} className="bg-primary">Submit Review</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="affiliate" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="text-2xl font-bold text-green-600">{product.commission_rate}%</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Avg Earnings/Sale</p>
                  <p className="text-2xl font-bold">{product.avg_earnings_per_sale ? formatUSD(product.avg_earnings_per_sale) : '—'}</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Refund Rate</p>
                  <p className="text-2xl font-bold">{product.refund_rate || 0}%</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-2xl font-bold capitalize">{product.product_type}</p>
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
  );
}

ProductDetail.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>