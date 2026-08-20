import React from 'react'
import { Link } from '@adonisjs/inertia/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp } from 'lucide-react'
import { formatCurrency, formatUSD } from '@/lib/currency'
import { usePage } from '@adonisjs/inertia/react'

const CATEGORY_LABELS = {
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

export default function ProductCard({ product, showCommission = false }) {
  console.log(product)
  return (
    <Link href={`/product/${product.uuid || product.id}`}>
      <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {product.imageUrl || product.image_url ? (
            <img
              src={product.imageUrl || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
              <span className="text-4xl font-display font-bold text-primary/20">
                {product.name?.[0]}
              </span>
            </div>
          )}
          {(product.isFeatured || product.is_featured) && (
            <Badge
              className="absolute top-3 left-3 text-xs text-white border-0"
              style={{ backgroundColor: '#81C14B' }}
            >
              Featured
            </Badge>
          )}
          {(product.salePrice || product.sale_price) &&
          (product.salePrice || product.sale_price) < product.price ? (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs">
              Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs font-normal">
              {(CATEGORY_LABELS as any)[product.category] || product.category}
            </Badge>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span>{product.rating?.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-end justify-between pt-1">
            <div>
              {(product.salePrice || product.sale_price) &&
              (product.salePrice || product.sale_price) < product.price ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    {formatUSD(product.salePrice || product.sale_price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatUSD(product.price)}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-lg">{formatUSD(product.price)}</span>
              )}
            </div>
            {showCommission &&
              (product.commissionRate ?? product.commission_rate ?? product.commission) !==
                undefined && (
                <div
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{ color: '#81C14B', background: 'rgba(129,193,75,0.12)' }}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-semibold">
                    {product.commissionRate ?? product.commission_rate ?? product.commission}%
                  </span>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
