import DashboardLayout from '@/components/layout/DashboardLayout'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD as formatCurrency } from '@/lib/currency'
import { format, subDays } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'

const COLORS = ['#F4A300', '#81C14B', '#715AFF', '#001845', '#e11d48', '#0891b2']

function KpiCard({ title, value, icon: Icon, color = '#F4A300' }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type VendorAnalyticsProps = {
  user: any
  orders: any[]
  products: any[]
}

export default function VendorAnalytics(props: VendorAnalyticsProps) {
  const { orders, products } = props

  // Helper: parse a decimal string safely to float, rounded to 2dp to avoid float drift
  const toAmount = (v: any) => Math.round((parseFloat(v) || 0) * 100) / 100

  // Helper: extract a UTC yyyy-MM-dd string from an ISO timestamp
  const toUTCDate = (iso: string): string => {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
  }

  // --- KPI calculations ---
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + toAmount(o.vendorPayout), 0)
  const totalOrders = completedOrders.length
  const affiliateSales = completedOrders.filter((o) => o.affiliateId).length
  const activeAffiliates = new Set(
    completedOrders.filter((o) => o.affiliateId).map((o) => o.affiliateId)
  ).size

  // --- 30-day revenue trend ---
  // Build a map of UTC date → revenue for O(1) lookup
  const revenueByUTCDate: Record<string, number> = {}
  completedOrders.forEach((o) => {
    const dateKey = toUTCDate(o.createdAt)
    if (!dateKey) return
    revenueByUTCDate[dateKey] = (revenueByUTCDate[dateKey] || 0) + toAmount(o.vendorPayout)
  })

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(new Date(), 29 - i)
    const utcKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    return {
      day: format(day, 'MMM d'),
      revenue: Math.round((revenueByUTCDate[utcKey] || 0) * 100) / 100,
    }
  })

  // --- Revenue by product (pie) ---
  const productSalesMap: Record<string, { name: string; value: number; orders: number }> = {}
  completedOrders.forEach((o) => {
    const key = o.productName || 'Unknown'
    if (!productSalesMap[key]) productSalesMap[key] = { name: key, value: 0, orders: 0 }
    productSalesMap[key].value += toAmount(o.vendorPayout)
    productSalesMap[key].orders++
  })
  const pieData = Object.values(productSalesMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((d) => ({ ...d, value: Math.round(d.value * 100) / 100 }))

  // --- Product sales bar chart (uses live stats enriched by controller) ---
  const productBar = products.slice(0, 8).map((p) => ({
    name: (p.name || '').substring(0, 14),
    sales: Number(p.totalSales) || 0,
    revenue: toAmount(p.totalRevenue),
  }))

  // --- Formatters ---
  const tickFmt = (v: number) => formatCurrency(v, true)
  const revTooltipFmt = (v: number): [string, string] => [formatCurrency(v), 'Revenue']

  // --- Derived metrics ---
  const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0
  const affiliatePct = totalOrders > 0 ? ((affiliateSales / totalOrders) * 100).toFixed(0) : '0'
  const activeListings = products.filter((p) => p.status === 'approved').length
  const refundCount = orders.filter((o) => o.status === 'refunded').length

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Deep dive into your store performance data
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            color="#81C14B"
          />
          <KpiCard
            title="Completed Orders"
            value={totalOrders}
            icon={ShoppingBag}
            color="#F4A300"
          />
          <KpiCard
            title="Products Listed"
            value={products.length}
            icon={Package}
            color="#715AFF"
          />
          <KpiCard
            title="Active Affiliates"
            value={activeAffiliates}
            icon={Users}
            color="#001845"
          />
        </div>

        {/* 30-day revenue trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">30-Day Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {totalOrders === 0 ? (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                No sales data yet
              </div>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last30}>
                    <defs>
                      <linearGradient id="rev30" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#81C14B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#81C14B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={tickFmt} width={60} />
                    <Tooltip formatter={revTooltipFmt} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#81C14B"
                      fill="url(#rev30)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by product + product sales count */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Revenue by Product</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  No completed sales yet
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Product Sales Count</CardTitle>
            </CardHeader>
            <CardContent>
              {productBar.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  No products yet
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productBar}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip
                        formatter={(v: number, name: string) =>
                          name === 'revenue' ? [formatCurrency(v), 'Revenue'] : [v, 'Sales']
                        }
                      />
                      <Bar dataKey="sales" fill="#F4A300" radius={[4, 4, 0, 0]} name="Sales" />
                      <Bar dataKey="revenue" fill="#81C14B" radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#81C14B]">{formatCurrency(avgOrderValue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Order Value</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#F4A300]">{affiliatePct}%</p>
                <p className="text-xs text-muted-foreground mt-1">Affiliate-Driven Sales</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#715AFF]">{activeListings}</p>
                <p className="text-xs text-muted-foreground mt-1">Active Listings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#001845]">{refundCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Refunds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
