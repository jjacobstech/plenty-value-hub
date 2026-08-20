import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MousePointer, ShoppingCart, TrendingUp, DollarSign, Download, Search } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const SOURCE_COLORS: Record<string, string> = {
  affiliate: '#81C14B',
  direct: '#001845',
  organic: '#f59e0b',
  referral: '#6366f1',
  other: '#9ca3af',
}

import { formatCurrency as formatUSD } from '@/lib/currency'

type Order = {
  id: number
  amount: string
  status: string | null
  affiliateId: number | null
  createdAt: string
  productName: string | null
}

type Link = {
  id: number
  clicks: number | null
  conversions: number | null
  revenue: string | null
  campaignName: string | null
  productName: string | null
  status: string | null
}

type Props = { orders: Order[]; links: Link[] }

export default function AdminConversions({ orders = [], links = [] }: Props) {
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')

  const completedOrders = orders.filter((o) => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((s, o) => s + Number(o.amount || 0), 0)
  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0)
  const totalConversions = links.reduce((s, l) => s + (l.conversions || 0), 0)
  const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0'

  // Revenue by product name from links
  const byProduct: Record<string, number> = {}
  links.forEach((l) => {
    const name = l.productName || 'Unknown'
    byProduct[name] = (byProduct[name] || 0) + Number(l.revenue || 0)
  })
  const revenueByProduct = Object.entries(byProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, revenue]) => ({ name: name.substring(0, 16), revenue }))

  const filteredLinks = links.filter((l) => {
    const matchSearch =
      !search ||
      l.productName?.toLowerCase().includes(search.toLowerCase()) ||
      l.campaignName?.toLowerCase().includes(search.toLowerCase())
    const matchSource = sourceFilter === 'all' || l.status === sourceFilter
    return matchSearch && matchSource
  })

  const exportCSV = () => {
    const rows = [['Product', 'Campaign', 'Clicks', 'Conversions', 'Revenue', 'Status']]
    filteredLinks.forEach((l) =>
      rows.push([
        l.productName || '',
        l.campaignName || '',
        String(l.clicks || 0),
        String(l.conversions || 0),
        String(l.revenue || 0),
        l.status || '',
      ])
    )
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'conversions.csv'
    a.click()
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
              Conversion Tracking
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track clicks, purchases and revenue attribution across all affiliate links
            </p>
          </div>
          <Button onClick={exportCSV} variant="outline" className="gap-2 border-gray-200">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            icon={MousePointer}
          />
          <StatsCard
            title="Conversions"
            value={totalConversions.toLocaleString()}
            icon={ShoppingCart}
          />
          <StatsCard title="Conv. Rate" value={`${convRate}%`} icon={TrendingUp} />
          <StatsCard title="Revenue" value={formatUSD(totalRevenue)} icon={DollarSign} />
        </div>

        {revenueByProduct.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue by Product (Affiliate Links)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByProduct}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatUSD(v)} />
                    <Bar dataKey="revenue" fill="#81C14B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">Affiliate Links Performance</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-8 h-8 w-40 text-sm"
                  />
                </div>
                {['all', 'active', 'inactive'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSourceFilter(t)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={
                      sourceFilter === t
                        ? { background: '#81C14B', color: '#fff' }
                        : { background: '#f3f4f6', color: '#6b7280' }
                    }
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLinks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MousePointer className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No affiliate link data yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Product', 'Campaign', 'Clicks', 'Conversions', 'Revenue', 'Status'].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left py-2 px-3 text-xs font-medium text-gray-500"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLinks.slice(0, 100).map((l) => (
                      <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-700 max-w-32 truncate">
                          {l.productName || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 max-w-32 truncate">
                          {l.campaignName || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-medium" style={{ color: '#001845' }}>
                          {(l.clicks || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-green-600">
                          {l.conversions || 0}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-green-700">
                          {l.revenue ? formatUSD(Number(l.revenue)) : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            className={
                              l.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }
                          >
                            {l.status || 'unknown'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLinks.length > 100 && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Showing 100 of {filteredLinks.length}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
