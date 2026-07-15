import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatsCard from '@/components/shared/StatsCard'
import {
  MousePointer,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Download,
  Search,
  Filter,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatUSD } from '@/lib/currency'

const SOURCE_COLORS = {
  newsletter: '#81C14B',
  blog: '#001845',
  email_campaign: '#f59e0b',
  affiliate_link: '#6366f1',
  direct: '#9ca3af',
}
const SOURCE_LABELS = {
  newsletter: 'Newsletter',
  blog: 'Blog',
  email_campaign: 'Email Campaign',
  affiliate_link: 'Affiliate Link',
  direct: 'Direct',
}

export default function AdminConversions() {
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data: events = [] } = useQuery({
    queryKey: ['conversion-events'],
    queryFn: () => base44.entities.ConversionEvent.list('-created_date', 500),
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders-conv'],
    queryFn: () => base44.entities.Order.filter({ status: 'completed' }, '-created_date', 200),
  })

  const clicks = events.filter((e) => e.event_type === 'click')
  const purchases = events.filter((e) => e.event_type === 'purchase')
  const totalRevenue = events
    .filter((e) => e.event_type === 'purchase')
    .reduce((s, e) => s + (e.revenue || 0), 0)
  const convRate = clicks.length > 0 ? ((purchases.length / clicks.length) * 100).toFixed(1) : '0'

  const bySource = Object.entries(
    events.reduce((acc, e) => {
      acc[e.source] = (acc[e.source] || 0) + 1
      return acc
    }, {})
  ).map(([source, count]) => ({
    source: SOURCE_LABELS[source] || source,
    count,
    fill: SOURCE_COLORS[source] || '#ccc',
  }))

  const revenueBySource = Object.entries(
    events
      .filter((e) => e.event_type === 'purchase')
      .reduce((acc, e) => {
        acc[e.source] = (acc[e.source] || 0) + (e.revenue || 0)
        return acc
      }, {})
  ).map(([source, revenue]) => ({ source: SOURCE_LABELS[source] || source, revenue }))

  const filtered = events.filter((e) => {
    const matchSearch =
      !search ||
      e.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.source_name?.toLowerCase().includes(search.toLowerCase())
    const matchSource = sourceFilter === 'all' || e.source === sourceFilter
    const matchType = typeFilter === 'all' || e.event_type === typeFilter
    return matchSearch && matchSource && matchType
  })

  const exportCSV = () => {
    const rows = [['Type', 'Source', 'Source Name', 'Product', 'Revenue', 'Date']]
    filtered.forEach((e) =>
      rows.push([
        e.event_type,
        e.source,
        e.source_name || '',
        e.product_name || '',
        e.revenue || 0,
        e.created_date?.split('T')[0] || '',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
            Conversion Tracking
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track clicks, purchases and revenue attribution across all sources
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2 border-gray-200">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Clicks"
          value={clicks.length.toLocaleString()}
          icon={MousePointer}
        />
        <StatsCard
          title="Purchases"
          value={purchases.length.toLocaleString()}
          icon={ShoppingCart}
        />
        <StatsCard title="Conv. Rate" value={`${convRate}%`} icon={TrendingUp} />
        <StatsCard title="Revenue" value={formatUSD(totalRevenue)} icon={DollarSign} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {bySource.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySource} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {bySource.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueBySource.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueBySource}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatUSD(v)} />
                    <Bar dataKey="revenue" fill="#81C14B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attribution summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(SOURCE_LABELS).map(([key, label]) => {
          const srcPurchases = events.filter((e) => e.event_type === 'purchase' && e.source === key)
          const srcRevenue = srcPurchases.reduce((s, e) => s + (e.revenue || 0), 0)
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div
                  className="w-2 h-2 rounded-full mb-2"
                  style={{ background: SOURCE_COLORS[key] }}
                />
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-bold" style={{ color: '#001845' }}>
                  {srcPurchases.length}
                </p>
                <p className="text-xs text-gray-400">{formatUSD(srcRevenue)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Events table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">All Events</CardTitle>
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
              {['all', 'click', 'purchase'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={
                    typeFilter === t
                      ? { background: '#81C14B', color: '#fff' }
                      : { background: '#f3f4f6', color: '#6b7280' }
                  }
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
              {['all', ...Object.keys(SOURCE_LABELS)].map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={
                    sourceFilter === s
                      ? { background: '#001845', color: '#fff' }
                      : { background: '#f3f4f6', color: '#6b7280' }
                  }
                >
                  {s === 'all' ? 'All Sources' : SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MousePointer className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No conversion events tracked yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Type', 'Source', 'Campaign', 'Product', 'Revenue', 'Date'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-3">
                        <Badge
                          className={
                            e.event_type === 'purchase'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {e.event_type}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: SOURCE_COLORS[e.source] + '20',
                            color: SOURCE_COLORS[e.source],
                          }}
                        >
                          {SOURCE_LABELS[e.source] || e.source}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 text-xs max-w-32 truncate">
                        {e.source_name || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 text-xs max-w-32 truncate">
                        {e.product_name || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-green-600">
                        {e.revenue ? formatUSD(e.revenue) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 text-xs">
                        {e.created_date?.split('T')[0] || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 100 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Showing 100 of {filtered.length}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
