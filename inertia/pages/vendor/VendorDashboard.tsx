import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatUSD as formatNGN } from '@/lib/currency';
import { format, subDays, startOfDay } from 'date-fns';
import {
  Wallet, ShoppingBag, Package, TrendingUp, Clock, CheckCircle2,
  ArrowUpRight, Store, Star, AlertCircle
} from 'lucide-react';

function KpiCard({ title, value, sub, icon: Icon, color = 'primary', trend }) {
  const colorMap = {
    primary: 'bg-[#001845]/10 text-[#001845]',
    green: 'bg-[#81C14B]/10 text-[#81C14B]',
    navy: 'bg-[#001845]/10 text-[#001845]',
    purple: 'bg-[#715AFF]/10 text-[#715AFF]',
  };
  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              <ArrowUpRight className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}


type VendorDashboardProps = {
  products: any[], orders: any[]
}


export default function VendorDashboard(props: VendorDashboardProps) {
  const { products, orders } = props
  const [user, setUser] = useState(null);
  useEffect(() => { [].then(setUser); }, []);



  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.vendor_payout || 0), 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (o.vendor_payout || 0), 0);
  const affiliateSales = completedOrders.filter(o => o.affiliate_id).length;
  const activeProducts = products.filter(p => p.status === 'approved').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;

  // Build 7-day revenue chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, 'MMM d');
    const dayRevenue = completedOrders
      .filter(o => format(new Date(o.created_date), 'MMM d') === dayStr)
      .reduce((sum, o) => sum + (o.vendor_payout || 0), 0);
    return { day: dayStr, revenue: dayRevenue };
  });

  // Product performance
  const productMap = {};
  completedOrders.forEach(o => {
    const key = o.product_name || 'Unknown';
    if (!productMap[key]) productMap[key] = { name: key, sales: 0, revenue: 0 };
    productMap[key].sales++;
    productMap[key].revenue += o.vendor_payout || 0;
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    refunded: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-[#81C14B]" />
            Seller Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}! Here's your store performance.
          </p>
        </div>
        {pendingProducts > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            {pendingProducts} product{pendingProducts > 1 ? 's' : ''} awaiting approval
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue" value={formatNGN(totalRevenue)} icon={Wallet} color="green" sub="Confirmed payouts" />
        <KpiCard title="Total Orders" value={completedOrders.length} icon={ShoppingBag} color="primary" sub={`${pendingOrders.length} pending`} />
        <KpiCard title="Active Products" value={activeProducts} icon={Package} color="navy" sub={`${products.length} total listed`} />
        <KpiCard title="Affiliate Sales" value={affiliateSales} icon={TrendingUp} color="purple" sub="Sales via affiliates" />
      </div>

      {/* Revenue Chart + Pending */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#81C14B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#81C14B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatNGN(v, true)} />
                  <Tooltip formatter={v => formatNGN(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#81C14B" fill="url(#rev)" strokeWidth={2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Available</span>
              </div>
              <span className="font-bold text-green-700">{formatNGN(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">Pending</span>
              </div>
              <span className="font-bold text-amber-700">{formatNGN(pendingRevenue)}</span>
            </div>
            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg order value</span>
                <span className="font-semibold">{formatNGN(completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved products</span>
                <span className="font-semibold">{activeProducts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Affiliate-driven</span>
                <span className="font-semibold">{affiliateSales} sales</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-4">
        {topProducts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => formatNGN(v, true)} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={v => formatNGN(v)} />
                    <Bar dataKey="revenue" fill="#001845" radius={[0, 4, 4, 0]} name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 6).map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs max-w-[100px] truncate">{order.product_name}</TableCell>
                      <TableCell className="text-xs">{formatNGN(order.amount)}</TableCell>
                      <TableCell className="font-semibold text-xs text-green-600">{formatNGN(order.vendor_payout)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10 text-sm">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


