import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD as formatNGN } from '@/lib/currency'
import { format, subDays } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MousePointer2, ShoppingBag, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react'

const COLORS = ['#715AFF', '#F4A300', '#81C14B', '#001845', '#e11d48']

function KpiCard({ title, value, sub, icon: Icon, color = '#715AFF' }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type AffiliatePerformanceProps = {
  user: any
  links: any[]
  performance: any
}

export default function AffiliatePerformance(props: AffiliatePerformanceProps) {
  const { links, performance } = props

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0)
  const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0)
  const totalEarnings = links.reduce((sum, l) => sum + (l.commission_earned || 0), 0)
  const totalRevenue = links.reduce((sum, l) => sum + (l.revenue || 0), 0)
  const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0'
  const epc = totalClicks > 0 ? totalEarnings / totalClicks : 0 // earnings per click

  const topLinks = [...links]
    .sort((a, b) => (b.commission_earned || 0) - (a.commission_earned || 0))
    .slice(0, 5)

  const chartData = topLinks.map((l) => ({
    name: (l.product_name || 'Product').substring(0, 14),
    earnings: l.commission_earned || 0,
    clicks: l.clicks || 0,
    conversions: l.conversions || 0,
  }))

  // 7-day clicks chart (placeholder data — random values stable across renders)
  const last7 = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const day = subDays(new Date(), 6 - i)
        const dayStr = format(day, 'MMM d')
        return { day: dayStr, clicks: Math.floor(Math.random() * 20), earnings: 0 }
      }),
    []
  )

  // Category split from links
  const catMap = {}
  links.forEach((l) => {
    const cat = l.product_name?.split(' ')[0] || 'Other'
    catMap[cat] = (catMap[cat] || 0) + (l.commission_earned || 0)
  })
  const pieData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .slice(0, 5)

  return (
    <DashboardLayout role="affiliate">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Track your affiliate marketing metrics in real-time
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Earnings (₦)"
            value={formatNGN(totalEarnings)}
            icon={Wallet}
            color="#81C14B"
            sub="All commissions"
          />
          <KpiCard
            title="Total Revenue (₦)"
            value={formatNGN(totalRevenue)}
            icon={TrendingUp}
            color="#F4A300"
            sub="Referred sales"
          />
          <KpiCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            icon={MousePointer2}
            color="#715AFF"
            sub={`${convRate}% conv. rate`}
          />
          <KpiCard
            title="Conversions"
            value={totalConversions}
            icon={ShoppingBag}
            color="#001845"
            sub="Completed sales"
          />
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'EPC (₦)', value: formatNGN(epc), note: 'Earnings per click' },
            { label: 'Conv. Rate', value: `${convRate}%`, note: 'Clicks to sales' },
            {
              label: 'Active Links',
              value: links.filter((l) => l.status === 'active').length,
              note: 'Promoting now',
            },
            {
              label: 'Avg Commission',
              value: links.length > 0 ? formatNGN(totalEarnings / links.length) : '₦0',
              note: 'Per link',
            },
          ].map((m, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold">{m.value}</p>
                <p className="text-sm font-medium mt-0.5">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Top Products Bar Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Top Products by Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatNGN(v, true)} />
                      <Tooltip formatter={(v) => formatNGN(v)} />
                      <Bar
                        dataKey="earnings"
                        fill="#715AFF"
                        radius={[4, 4, 0, 0]}
                        name="Earnings (₦)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clicks vs Conversions */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Clicks vs Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#F4A300" radius={[4, 4, 0, 0]} name="Clicks" />
                      <Bar
                        dataKey="conversions"
                        fill="#81C14B"
                        radius={[4, 4, 0, 0]}
                        name="Conversions"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Links Table */}
        {topLinks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Top Performing Links</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Revenue (₦)</TableHead>
                    <TableHead>Earned (₦)</TableHead>
                    <TableHead>EPC (₦)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLinks.map((link, idx) => (
                    <TableRow key={link.id}>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        #{idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">{link.product_name}</TableCell>
                      <TableCell>{link.clicks || 0}</TableCell>
                      <TableCell>{link.conversions || 0}</TableCell>
                      <TableCell>{formatNGN(link.revenue)}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatNGN(link.commission_earned)}
                      </TableCell>
                      <TableCell>
                        {link.clicks > 0
                          ? formatNGN((link.commission_earned || 0) / link.clicks)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
