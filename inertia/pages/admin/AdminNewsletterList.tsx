import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Send, Eye, MousePointer, Archive, Trash2, Plus, TrendingUp } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { toast } from 'sonner'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}

type Newsletter = {
  id: number
  subject: string
  category: string | null
  status: string
  recipientsCount: number
  openCount: number
  clickCount: number
  revenueGenerated: number
  sentAt: string | null
  createdAt: string
}

type Props = { newsletters: Newsletter[]; subscriberCount: number }

export default function AdminNewsletterList({
  newsletters: initialNewsletters = [],
  subscriberCount: _subscriberCount = 0,
}: Props) {
  const [newsletters, setNewsletters] = useState(initialNewsletters)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const sent = newsletters.filter((n) => n.status === 'sent')
  const totalRecipients = sent.reduce((s, n) => s + (n.recipientsCount || 0), 0)
  const totalOpens = sent.reduce((s, n) => s + (n.openCount || 0), 0)
  const avgOpenRate = totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : '0'
  const totalRevenue = newsletters.reduce((s, n) => s + (n.revenueGenerated || 0), 0)

  const performanceData = sent.slice(0, 6).map((n) => ({
    name: n.subject?.substring(0, 14) + '…',
    opens: n.openCount || 0,
    clicks: n.clickCount || 0,
  }))

  const filtered = newsletters.filter((n) => {
    const matchSearch = !search || n.subject?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || n.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleArchive = async (id: number) => {
    try {
      await axios.put(`/api/admin/newsletters/${id}`, { status: 'archived' })
      setNewsletters((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'archived' } : n)))
      toast.success('Archived')
    } catch {
      toast.error('Failed to archive')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/newsletters/${id}`)
      setNewsletters((prev) => prev.filter((n) => n.id !== id))
      toast.success('Newsletter deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
              Newsletters
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your newsletter campaigns and track performance
            </p>
          </div>
          <Link href="/admin/newsletter">
            <Button className="gap-2 bg-primary text-white">
              <Plus className="w-4 h-4" /> Compose Newsletter
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Newsletters" value={newsletters.length} icon={Mail} />
          <StatsCard title="Sent" value={sent.length} icon={Send} />
          <StatsCard title="Avg Open Rate" value={`${avgOpenRate}%`} icon={Eye} />
          <StatsCard
            title="Revenue Generated"
            value={`$${totalRevenue.toFixed(0)}`}
            icon={TrendingUp}
          />
        </div>

        {performanceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Newsletter Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="opens" fill="#81C14B" radius={[4, 4, 0, 0]} name="Opens" />
                    <Bar dataKey="clicks" fill="#001845" radius={[4, 4, 0, 0]} name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">All Newsletters</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-8 h-8 w-40 text-sm"
                  />
                </div>
                {['all', 'draft', 'sent', 'archived'].map((s) => (
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
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>
                  No newsletters yet.{' '}
                  <Link href="/admin/newsletter" className="text-primary">
                    Compose one!
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-sm truncate" style={{ color: '#001845' }}>
                          {n.subject || 'Untitled'}
                        </h3>
                        <Badge variant="default" className={STATUS_COLORS[n.status] || ''}>
                          {n.status}
                        </Badge>
                        {n.category && (
                          <Badge variant="outline" className="text-xs">
                            {n.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {n.openCount || 0} opens
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          {n.clickCount || 0} clicks
                        </span>
                        <span>{n.recipientsCount || 0} recipients</span>
                        {n.sentAt && <span>{new Date(n.sentAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {n.status !== 'archived' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400"
                          onClick={() => handleArchive(n.id)}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(n.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
