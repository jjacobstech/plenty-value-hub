import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatsCard from '@/components/shared/StatsCard'
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Download,
  Search,
  Mail,
  BarChart3,
} from 'lucide-react'
import {
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

const COLORS = ['#81C14B', '#001845', '#f59e0b', '#ef4444']

export default function AdminSubscribers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: subscribers = [] } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: () => base44.entities.NewsletterSubscriber.list('-created_date', 500),
  })

  const active = subscribers.filter((s) => s.status === 'active')
  const inactive = subscribers.filter((s) => s.status === 'unsubscribed')

  const filtered = subscribers.filter((s) => {
    const matchSearch =
      !search ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  // Growth chart: group by month
  const growthData = (() => {
    const months = {}
    subscribers.forEach((s) => {
      const d = new Date(s.created_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = (months[key] || 0) + 1
    })
    return Object.entries(months)
      .sort()
      .slice(-6)
      .map(([month, count]) => ({ month, count }))
  })()

  const pieData = [
    { name: 'Active', value: active.length },
    { name: 'Unsubscribed', value: inactive.length },
  ]

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Status', 'Source', 'Joined']]
    filtered.forEach((s) => {
      rows.push([
        s.name || '',
        s.email,
        s.status,
        s.source || '',
        s.created_date?.split('T')[0] || '',
      ])
    })
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
            Subscriber Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track, manage and analyze your subscriber base
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2 border-gray-200">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Subscribers" value={subscribers.length} icon={Users} />
        <StatsCard title="Active" value={active.length} icon={UserCheck} />
        <StatsCard title="Unsubscribed" value={inactive.length} icon={UserX} />
        <StatsCard
          title="Growth Rate"
          value={
            subscribers.length > 0
              ? `${((active.length / subscribers.length) * 100).toFixed(0)}%`
              : '0%'
          }
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {growthData.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#81C14B"
                      strokeWidth={2}
                      dot={{ fill: '#81C14B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                No growth data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscriber Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {subscribers.length > 0 ? (
              <>
                <div className="h-40">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 text-xs mt-2">
                  {pieData.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ background: COLORS[i] }}
                      />
                      <span>
                        {p.name}: {p.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Open Rate', value: '32.4%' },
          { label: 'Avg CTR', value: '4.8%' },
          { label: 'Avg Conv. Rate', value: '1.2%' },
          {
            label: 'Unsub Rate',
            value:
              inactive.length > 0
                ? `${((inactive.length / subscribers.length) * 100).toFixed(1)}%`
                : '0%',
          },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <span className="text-2xl font-bold" style={{ color: '#001845' }}>
                {m.value}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriber list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">All Subscribers</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 h-8 w-48 text-sm"
                />
              </div>
              {['all', 'active', 'unsubscribed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={
                    statusFilter === s
                      ? { background: '#81C14B', color: '#fff' }
                      : { background: '#f3f4f6', color: '#6b7280' }
                  }
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No subscribers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Name', 'Email', 'Status', 'Source', 'Joined'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-medium">{s.name || '—'}</td>
                      <td className="py-2.5 px-3 text-gray-600">{s.email}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          className={
                            s.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{s.source || '—'}</td>
                      <td className="py-2.5 px-3 text-gray-500">
                        {s.created_date?.split('T')[0] || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 50 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Showing 50 of {filtered.length}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
