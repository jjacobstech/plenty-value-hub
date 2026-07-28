import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Send, Plus, Mail, Users, TrendingUp, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { router } from '@inertiajs/react'

const CAMPAIGN_TYPES = ['product_promo', 'announcement', 'buying_guide', 'review', 'offer'] as const
const TYPE_LABELS: Record<string, string> = {
  product_promo: 'Product Promo',
  announcement: 'Announcement',
  buying_guide: 'Buying Guide',
  review: 'Review',
  offer: 'Offer',
}
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
}

const EMPTY = {
  name: '',
  subject: '',
  content: '',
  campaign_type: 'product_promo',
  audience_segment: '',
  status: 'draft',
}

type Campaign = {
  id: number
  name: string
  subject: string
  content: string | null
  campaignType: string
  audienceSegment: string | null
  status: string
  recipientsCount: number
  openCount: number
  clickCount: number
  conversionCount: number
  revenueGenerated: number
  sentAt: string | null
}

type Props = { campaigns: Campaign[]; subscriberCount: number }

export default function AdminEmailCampaigns({
  campaigns: initialCampaigns = [],
  subscriberCount = 0,
}: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [loading, setLoading] = useState(false)

  const totalSent = campaigns.filter((c) => c.status === 'sent').length
  const totalRecipients = campaigns
    .filter((c) => c.status === 'sent')
    .reduce((s, c) => s + (c.recipientsCount || 0), 0)
  const avgOpenRate =
    campaigns.length > 0
      ? (
          (campaigns.reduce(
            (s, c) => s + (c.recipientsCount > 0 ? (c.openCount || 0) / c.recipientsCount : 0),
            0
          ) /
            campaigns.length) *
          100
        ).toFixed(1)
      : '0'

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  const openEdit = (c: Campaign) => {
    setEditing(c)
    setForm({
      name: c.name,
      subject: c.subject,
      content: c.content || '',
      campaign_type: c.campaignType,
      audience_segment: c.audienceSegment || '',
      status: c.status,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (editing) {
        const res = await axios.put(`/api/admin/email-campaigns/${editing.id}`, form)
        setCampaigns((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...res.data } : c)))
      } else {
        const res = await axios.post('/api/admin/email-campaigns', {
          ...form,
          recipients_count: subscriberCount,
        })
        setCampaigns((prev) => [res.data, ...prev])
      }
      toast.success('Campaign saved')
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY)
    } catch {
      toast.error('Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (c: Campaign) => {
    try {
      const res = await axios.put(`/api/admin/email-campaigns/${c.id}`, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: subscriberCount,
      })
      setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...res.data } : x)))
      toast.success(`Campaign "${c.name}" sent to ${subscriberCount} subscribers`)
    } catch {
      toast.error('Failed to send campaign')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/email-campaigns/${id}`)
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete campaign')
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
              Email Campaigns
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and send targeted email campaigns to your subscribers
            </p>
          </div>
          <Button onClick={openNew} className="gap-2 bg-primary text-white">
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Campaigns" value={campaigns.length} icon={Mail} />
          <StatsCard title="Campaigns Sent" value={totalSent} icon={Send} />
          <StatsCard
            title="Total Recipients"
            value={totalRecipients.toLocaleString()}
            icon={Users}
          />
          <StatsCard title="Avg Open Rate" value={`${avgOpenRate}%`} icon={TrendingUp} />
        </div>

        <div className="grid gap-4">
          {campaigns.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No campaigns yet. Create your first campaign!</p>
              </CardContent>
            </Card>
          )}
          {campaigns.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-sm truncate" style={{ color: '#001845' }}>
                        {c.name}
                      </h3>
                      <Badge className={STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}>
                        {c.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[c.campaignType] || c.campaignType}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 truncate">{c.subject}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {[
                        { label: 'Recipients', value: c.recipientsCount || 0 },
                        { label: 'Opens', value: c.openCount || 0 },
                        { label: 'Clicks', value: c.clickCount || 0 },
                        { label: 'Conversions', value: c.conversionCount || 0 },
                        { label: 'Revenue', value: `$${c.revenueGenerated || 0}` },
                      ].map((m) => (
                        <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-400">{m.label}</p>
                          <p className="text-sm font-bold" style={{ color: '#001845' }}>
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.status !== 'sent' && (
                      <Button
                        size="sm"
                        onClick={() => handleSend(c)}
                        className="gap-1 text-xs bg-primary text-white h-8"
                      >
                        <Send className="w-3 h-3" /> Send
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(c)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog
          open={showForm}
          onOpenChange={(v) => {
            if (!v) {
              setShowForm(false)
              setEditing(null)
              setForm(EMPTY)
            }
          }}
        >
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Summer Promo 2024"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Subject Line</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Type</label>
                <select
                  value={form.campaign_type}
                  onChange={(e) => setForm({ ...form, campaign_type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  {CAMPAIGN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Audience Segment</label>
                <Input
                  value={form.audience_segment}
                  onChange={(e) => setForm({ ...form, audience_segment: e.target.value })}
                  placeholder="e.g. All subscribers, Health niche..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  placeholder="Write your email content..."
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                    setForm(EMPTY)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="bg-primary text-white">
                  {loading ? 'Saving...' : 'Save Campaign'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
