import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatsCard from '@/components/shared/StatsCard';
import { Mail, Send, BarChart3, TrendingUp, Search, Eye, MousePointer, Archive, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = { draft: 'bg-yellow-100 text-yellow-700', scheduled: 'bg-blue-100 text-blue-700', sent: 'bg-green-100 text-green-700', archived: 'bg-gray-100 text-gray-500' };

export default function AdminNewsletterList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: newsletters = [] } = useQuery({
    queryKey: ['newsletters-list'],
    queryFn: () => base44.entities.Newsletter.list('-created_date', 100),
  });

  const deleteNL = useMutation({
    mutationFn: (id) => base44.entities.Newsletter.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['newsletters-list'] }); toast.success('Newsletter deleted'); },
  });

  const archiveNL = useMutation({
    mutationFn: (id) => base44.entities.Newsletter.update(id, { status: 'archived' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['newsletters-list'] }); toast.success('Archived'); },
  });

  const sent = newsletters.filter(n => n.status === 'sent');
  const totalRecipients = sent.reduce((s, n) => s + (n.recipients_count || 0), 0);
  const totalOpens = sent.reduce((s, n) => s + (n.open_count || 0), 0);
  const avgOpenRate = totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : '0';
  const totalRevenue = newsletters.reduce((s, n) => s + (n.revenue_generated || 0), 0);

  const performanceData = sent.slice(0, 6).map(n => ({
    name: n.subject?.substring(0, 14) + '...',
    opens: n.open_count || 0,
    clicks: n.click_count || 0,
  }));

  const filtered = newsletters.filter(n => {
    const matchSearch = !search || n.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>Newsletters</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your newsletter campaigns and track performance</p>
        </div>
        <Link to="/admin/newsletter">
          <Button className="gap-2 bg-primary text-white">
            <Plus className="w-4 h-4" /> Compose Newsletter
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Newsletters" value={newsletters.length} icon={Mail} />
        <StatsCard title="Sent" value={sent.length} icon={Send} />
        <StatsCard title="Avg Open Rate" value={`${avgOpenRate}%`} icon={Eye} />
        <StatsCard title="Revenue Generated" value={`$${totalRevenue.toFixed(0)}`} icon={TrendingUp} />
      </div>

      {performanceData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Newsletter Performance</CardTitle></CardHeader>
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
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 h-8 w-40 text-sm" />
              </div>
              {['all', 'draft', 'sent', 'archived'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={statusFilter === s ? { background: '#81C14B', color: '#fff' } : { background: '#f3f4f6', color: '#6b7280' }}>
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
              <p>No newsletters yet. <Link to="/admin/newsletter" className="text-primary">Compose one!</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(n => (
                <div key={n.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium text-sm truncate" style={{ color: '#001845' }}>{n.subject || 'Untitled'}</h3>
                      <Badge className={STATUS_COLORS[n.status] || ''}>{n.status}</Badge>
                      {n.category && <Badge variant="outline" className="text-xs">{n.category}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{n.open_count || 0} opens</span>
                      <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" />{n.click_count || 0} clicks</span>
                      <span>{n.recipients_count || 0} recipients</span>
                      {n.sent_at && <span>{new Date(n.sent_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {n.status !== 'archived' && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={() => archiveNL.mutate(n.id)}><Archive className="w-3.5 h-3.5" /></Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => deleteNL.mutate(n.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}