import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatUSD as formatNGN } from '@/lib/currency';
import { format, subDays } from 'date-fns';
import {
  Wallet, MousePointer2, ShoppingBag, TrendingUp, Clock, CheckCircle2,
  ArrowUpRight, Zap, Link2, Star
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

function KpiCard({ title, value, sub, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-[#001845]/10 text-[#001845]',
    green: 'bg-[#81C14B]/10 text-[#81C14B]',
    navy: 'bg-[#001845]/10 text-[#001845]',
    purple: 'bg-[#715AFF]/10 text-[#715AFF]',
    blue: 'bg-blue-100 text-blue-600',
  };
  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className={`inline-flex p-2.5 rounded-xl mb-3 ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}


type AffiliateDashboardProps = {
  links: any[], earnings: any
}


export default function AffiliateDashboard(props: AffiliateDashboardProps) {
  const { links, earnings } = props
  const [user, setUser] = useState(null);
  useEffect(() => { [].then(setUser); }, []);



  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);
  const totalEarnings = links.reduce((sum, l) => sum + (l.commission_earned || 0), 0);
  const pendingEarnings = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + (o.commission_amount || 0), 0);
  const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0';
  const activeLinks = links.filter(l => l.status === 'active').length;

  // 7-day earnings chart (simulated from orders)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, 'MMM d');
    const dayEarnings = orders
      .filter(o => o.status === 'completed' && format(new Date(o.created_date), 'MMM d') === dayStr)
      .reduce((sum, o) => sum + (o.commission_amount || 0), 0);
    return { day: dayStr, earnings: dayEarnings };
  });

  // Top 5 links by commission
  const topLinks = [...links].sort((a, b) => (b.commission_earned || 0) - (a.commission_earned || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#81C14B]" />
            Affiliate Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}! Keep growing your income.
          </p>
        </div>
        <Link href="/affiliate/products">
          <Button style={{ backgroundColor: '#81C14B' }} className="text-white hover:opacity-90">
            <Link2 className="w-4 h-4 mr-2" /> Find Products
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Earnings" value={formatNGN(totalEarnings)} icon={Wallet} color="green" sub="All-time commissions" />
        <KpiCard title="Total Clicks" value={totalClicks.toLocaleString()} icon={MousePointer2} color="primary" sub={`${activeLinks} active links`} />
        <KpiCard title="Conversions" value={totalConversions} icon={ShoppingBag} color="navy" sub={`${convRate}% conv. rate`} />
        <KpiCard title="Pending" value={formatNGN(pendingEarnings)} icon={Clock} color="purple" sub="Awaiting confirmation" />
      </div>

      {/* Earnings Chart + Summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Commissions — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7}>
                  <defs>
                    <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#715AFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#715AFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatNGN(v, true)} />
                  <Tooltip formatter={v => formatNGN(v)} />
                  <Area type="monotone" dataKey="earnings" stroke="#715AFF" fill="url(#earn)" strokeWidth={2} name="Earnings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Confirmed</span>
              </div>
              <span className="font-bold text-green-700">{formatNGN(totalEarnings)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">Pending</span>
              </div>
              <span className="font-bold text-amber-700">{formatNGN(pendingEarnings)}</span>
            </div>
            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-semibold">{convRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Links</span>
                <span className="font-semibold">{activeLinks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Links</span>
                <span className="font-semibold">{links.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Clicks</span>
                <span className="font-semibold">{totalClicks.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Links + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        {topLinks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Top Performing Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topLinks.map(l => ({ name: (l.product_name || 'Product').substring(0, 14), earned: l.commission_earned || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatNGN(v, true)} />
                    <Tooltip formatter={v => formatNGN(v)} />
                    <Bar dataKey="earned" fill="#001845" radius={[4, 4, 0, 0]} name="Earned ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">My Affiliate Links</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {links.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conv.</TableHead>
                    <TableHead>Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.slice(0, 6).map(link => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium text-xs max-w-[100px] truncate">{link.product_name}</TableCell>
                      <TableCell className="text-xs">{link.clicks || 0}</TableCell>
                      <TableCell className="text-xs">{link.conversions || 0}</TableCell>
                      <TableCell className="font-semibold text-xs text-green-600">{formatNGN(link.commission_earned)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm mb-3">No links yet. Start promoting products!</p>
                <Link href="/affiliate/products">
                  <Button size="sm" style={{ backgroundColor: '#81C14B' }} className="text-white">
                    Browse Products
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


