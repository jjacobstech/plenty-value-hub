import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen, Target, Award, MailOpen, TrendingUp, Users, Shield } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/components/layout/PublicLayout';

const VALUE_PROPS = [
  { icon: BookOpen, title: 'In-Depth Product Reviews', desc: 'Thorough, unbiased evaluations of the hottest products on the market.' },
  { icon: Target, title: 'Smart Buying Guides', desc: 'Category-specific guides to help you find exactly what you need.' },
  { icon: Award, title: 'Expert Comparisons', desc: 'Side-by-side product comparisons so you always get the best value.' },
  { icon: MailOpen, title: 'Consumer Insights', desc: 'Real data and trends helping 11,000+ subscribers make informed decisions.' },
];

type ReviewsProps = {
  reviews: any[]
}

export default function Reviews({ reviews = [] }: ReviewsProps) {

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section style={{ backgroundColor: '#001845' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4 border-0 text-sm" style={{ backgroundColor: '#81C14B', color: '#fff' }}>
                <Users className="w-3.5 h-3.5 mr-1.5" /> 11,000+ Active Subscribers
              </Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Helping You Make<br />
                <span style={{ color: '#81C14B' }}>Smarter Buying Decisions</span>
              </h1>
              <p className="text-slate-300 leading-relaxed mb-6">
                Expert product reviews, buying guides, and consumer insights delivered directly to your inbox.
                Compare products before you buy and never waste money on the wrong purchase again.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button style={{ backgroundColor: '#81C14B', color: '#fff' }} className="font-semibold">
                    Subscribe to Newsletter
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:text-white">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {VALUE_PROPS.map((vp, i) => (
                <div key={i} className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(129,193,75,0.2)' }}>
                    <vp.icon className="w-5 h-5" style={{ color: '#81C14B' }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{vp.title}</h3>
                  <p className="text-xs text-slate-400">{vp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap gap-8 items-center justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#81C14B' }} />
              <span className="font-bold text-sm" style={{ color: '#001845' }}>11,000+ Active Subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: '#001845' }} />
              <span className="font-bold text-sm" style={{ color: '#001845' }}>Unbiased Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: '#F4A300' }} />
              <span className="font-bold text-sm" style={{ color: '#001845' }}>Expert Buying Guides</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" style={{ color: '#81C14B' }} />
              <span className="font-bold text-sm" style={{ color: '#001845' }}>Verified Purchases</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold" style={{ color: '#001845' }}>Product Reviews</h2>
          <Badge variant="outline">{reviews.length} Reviews</Badge>
        </div>

        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <Card key={review.id} className="hover:shadow-md transition-all duration-200 hover:border-[#81C14B]/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link href={`/product/${review.product_id}`} className="font-semibold hover:underline transition-colors" style={{ color: '#001845' }}>
                        {review.product_name || 'Product'}
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{review.rating}/5</span>
                      </div>
                    </div>
                    {review.is_verified_purchase && (
                      <Badge className="text-xs border-0 flex items-center gap-1" style={{ backgroundColor: '#81C14B20', color: '#81C14B' }}>
                        <Shield className="w-3 h-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  {review.title && <p className="font-medium mb-1">{review.title}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                  <p className="text-xs text-muted-foreground mt-3">{review.reviewer_name || 'Anonymous'}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground text-lg font-medium">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share your product experience</p>
              <Link href="/marketplace" className="mt-4 inline-block">
                <Button style={{ backgroundColor: '#001845', color: '#fff' }}>Browse Products</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Reviews.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>