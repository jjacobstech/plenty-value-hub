import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Plus, BarChart3, Mail, Users, TrendingUp, Edit, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import StatsCard from '@/components/shared/StatsCard';

const CAMPAIGN_TYPES = ['product_promo', 'announcement', 'buying_guide', 'review', 'offer'];
const TYPE_LABELS = { product_promo: 'Product Promo', announcement: 'Announcement', buying_guide: 'Buying Guide', review: 'Review', offer: 'Offer' };
const STATUS_COLORS = { draft: 'bg-gray-100 text-gray-600', scheduled: 'bg-blue-100 text-blue-700', sent: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700' };

const EMPTY = { name: '', subject: '', content: '', campaign_type: 'product_promo', audience_segment: '', status: 'draft' };

export default function AdminEmailCampaigns() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => base44.entities.EmailCampaign.list('-created_date', 100),
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers-count'],
    queryFn: () => base44.entities.NewsletterSubscriber.filter({ status: 'active' }, null, 1000),
  });

  const save = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.EmailCampaign.update(editing.id, data)
      : base44.entities.EmailCampaign.create({ ...data, recipients_count: subscribers.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['email-campaigns'] }); setShowForm(false); setEditing(null); setForm(EMPTY); toast.success('Campaign saved'); },
  });

  const deleteCampaign = useMutation({
    mutationFn: (id) => base44.entities.EmailCampaign.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['email-campaigns'] }); toast.success('Deleted'); },
  });

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, subject: c.subject, content: c.content, campaign_type: c.campaign_type, audience_segment: c.audience_segment || '', status: c.status }); setShowForm(true); };

  const handleSend = async (c) => {
    await base44.entities.EmailCampaign.update(c.id, { status: 'sent', sent_at: new Date().toISOString(), recipients_count: subscribers.length });
    qc.invalidateQueries({ queryKey: ['email-campaigns'] });
    toast.success(`Campaign "${c.name}" sent to ${subscribers.length} subscribers`);
  };

  const totalSent = campaigns.filter(c => c.status === 'sent').length;
  const totalRecipients = campaigns.filter(c => c.status === 'sent').reduce((s, c) => s + (c.recipients_count || 0), 0);
  const avgOpenRate = campaigns.filter(c => c.recipients_count > 0).length > 0
    ? (campaigns.reduce((s, c) => s + (c.recipients_count > 0 ? (c.open_count || 0) / c.recipients_count : 0), 0) / campaigns.length * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>Email Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Create and send targeted email campaigns to your subscribers</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-primary text-white">
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Campaigns" value={campaigns.length} icon={Mail} />
        <StatsCard title="Campaigns Sent" value={totalSent} icon={Send} />
        <StatsCard title="Total Recipients" value={totalRecipients.toLocaleString()} icon={Users} />
        <StatsCard title="Avg Open Rate" value={`${avgOpenRate}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-4">
        {campaigns.length === 0 && (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No campaigns yet. Create your first campaign!</p>
          </CardContent></Card>
        )}
        {campaigns.map(c => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-sm truncate" style={{ color: '#001845' }}>{c.name}</h3>
                    <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[c.campaign_type]}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 truncate">{c.subject}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {[
                      { label: 'Recipients', value: c.recipients_count || 0 },
                      { label: 'Opens', value: c.open_count || 0 },
                      { label: 'Clicks', value: c.click_count || 0 },
                      { label: 'Conversions', value: c.conversion_count || 0 },
                      { label: 'Revenue', value: `$${(c.revenue_generated || 0).toFixed(0)}` },
                    ].map(m => (
                      <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">{m.label}</p>
                        <p className="text-sm font-bold" style={{ color: '#001845' }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status !== 'sent' && (
                    <Button size="sm" onClick={() => handleSend(c)} className="gap-1 text-xs bg-primary text-white h-8">
                      <Send className="w-3 h-3" /> Send
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => deleteCampaign.mutate(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={(v) => { if (!v) { setShowForm(false); setEditing(null); setForm(EMPTY); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Campaign Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Promo 2024" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subject Line</label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Email subject..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Campaign Type</label>
              <select value={form.campaign_type} onChange={e => setForm({ ...form, campaign_type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Audience Segment</label>
              <Input value={form.audience_segment} onChange={e => setForm({ ...form, audience_segment: e.target.value })} placeholder="e.g. All subscribers, Health niche..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content</label>
              <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} placeholder="Write your email content..." />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }}>Cancel</Button>
              <Button onClick={() => save.mutate(form)} disabled={save.isPending} className="bg-primary text-white">
                {save.isPending ? 'Saving...' : 'Save Campaign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}