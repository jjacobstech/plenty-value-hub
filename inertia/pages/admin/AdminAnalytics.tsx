import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Mail,
  BarChart3,
  Globe,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatUSD as formatNGN } from '@/lib/currency'

type Order = {
  id: number
  status: string | null
  amount: string
  platformFee: string | null
  commissionAmount: string | null
  productId: number | null
  productName: string | null
  buyerId: number | null
  vendorId: number | null
  affiliateId: number | null
  createdAt: string
}

// claude --resume 92e68622-fd2f-4772-a7bb-c861e17d6c76

type Product = {
  id: number
  name: string
  status: string | null
  category: string | null
  price: string | null
  commissionRate: string | null
  totalSales: number | null
  totalRevenue: string | null
  vendorId: number | null
  vendorName: string | null
  createdAt: string
}

type User = {
  id: number
  role: string
  email: string
  fullName?: string
}

type AffiliateLink = {
  id: number
  status: string | null
  clicks: number
  conversions: number
  commissionEarned: string | null
  revenue: string | null
  productName: string | null
  affiliateId: number
  affiliateName: string | null
  createdAt: string
}

type AdminAnalyticsProps = {
  products: Product[]
  orders: Order[]
  users: User[]
  links: AffiliateLink[]
  analytics?: any
}

export default function AdminAnalytics({
  products = [],
  orders = [],
  users = [],
  links = [],
}: AdminAnalyticsProps) {
  // Safe parsing helper
  const safeParseFloat = (value: any) => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  const safeParseInt = (value: any) => {
    const parsed = parseInt(value)
    return isNaN(parsed) ? 0 : parsed
  }

  const completedOrders = orders.filter((o) => o?.status === 'completed') || []

  const totalGMV = completedOrders.reduce((s, o) => {
    return s + safeParseFloat(o?.amount)
  }, 0)

  const platformRevenue = completedOrders.reduce((s, o) => {
    return s + safeParseFloat(o?.platformFee)
  }, 0)

  const affiliateCommissions = completedOrders.reduce((s, o) => {
    return s + safeParseFloat(o?.commissionAmount)
  }, 0)

  const totalClicks = (links || []).reduce((s, l) => s + safeParseInt(l?.clicks), 0)
  const totalConversions = (links || []).reduce((s, l) => s + safeParseInt(l?.conversions), 0)

  const refundedOrders = orders.filter((o) => o?.status === 'refunded') || []
  const refundRate =
    orders.length > 0 ? ((refundedOrders.length / orders.length) * 100).toFixed(1) : '0'

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform-wide marketplace metrics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="GMV (₦)" value={formatNGN(totalGMV)} icon={DollarSign} />
          <StatsCard
            title="Platform Revenue (₦)"
            value={formatNGN(platformRevenue)}
            icon={TrendingUp}
          />
          <StatsCard
            title="Affiliate Commissions (₦)"
            value={formatNGN(affiliateCommissions)}
            icon={BarChart3}
          />
          <StatsCard title="Total Users" value={users.length} icon={Users} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Orders" value={orders.length} icon={ShoppingCart} />
          <StatsCard
            title="Approved Products"
            value={products.filter((p) => p.status === 'approved').length}
            icon={Package}
          />
          <StatsCard title="Total Clicks" value={totalClicks.toLocaleString()} icon={Globe} />
          <StatsCard title="Refund Rate" value={`${refundRate}%`} icon={Mail} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const productRevenue: Record<string, number> = {}
                completedOrders.forEach((o) => {
                  if (!o) return

                  const productName = o.productName || 'Unknown Product'
                  const amount = safeParseFloat(o.amount)

                  productRevenue[productName] = (productRevenue[productName] || 0) + amount
                })

                const data = Object.entries(productRevenue)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([name, revenue]) => ({
                    name: name.substring(0, 15),
                    revenue: revenue as number,
                  }))

                return data.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip formatter={(v) => formatNGN(Number(v ?? 0))} />
                        <Bar dataKey="revenue" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data yet</p>
                )
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Affiliate Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Clicks</span>
                  <span className="font-bold">{totalClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Conversions</span>
                  <span className="font-bold">{totalConversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conv. Rate</span>
                  <span className="font-bold">
                    {totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Links</span>
                  <span className="font-bold">
                    {links.filter((l) => l.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Commissions</span>
                  <span className="font-bold text-green-600">
                    {formatNGN(affiliateCommissions)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
