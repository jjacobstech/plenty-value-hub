import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUSD as formatNGN } from '@/lib/currency';
import { format, subDays, startOfMonth } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';
import { Package, ShoppingBag, TrendingUp, BarChart3, Users } from 'lucide-react';

const COLORS = ['#F4A300', '#81C14B', '#715AFF', '#001845', '#e11d48', '#0891b2'];

function KpiCard({ title, value, icon: Icon, color = '#F4A300' }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorAnalytics() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: products = [] } = useQuery({
    queryKey: ['vendor-products', user?.id],
    queryFn: () => base44.entities.Product.filter({ vendor_id: user.id }, '-created_date', 100),
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['vendor-orders', user?.id],
    queryFn: () => base44.entities.Order.filter({ vendor_id: user.id }, '-created_date', 200),
    enabled: !!user,
  });

  const { data: affiliateLinks = [] } = useQuery({
    queryKey: ['vendor-affiliate-links'],
    queryFn: () => base44.entities.AffiliateLink.list('-created_date', 200),
    enabled: !!user,
  });

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.vendor_payout || 0), 0);
  const totalOrders = completedOrders.length;
  const affiliateSales = completedOrders.filter(o => o.affiliate_id).length;
  const activeAffiliates = new Set(completedOrders.filter(o => o.affiliate_id).map(o => o.affiliate_id)).size;

  // 30-day revenue trend
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(new Date(), 29 - i);
    const dayStr = format(day, 'MMM d');
    const dayRevenue = completedOrders
      .filter(o => format(new Date(o.created_date), 'MMM d') === dayStr)
      .reduce((sum, o) => sum + (o.vendor_payout || 0), 0);
    return { day: dayStr, revenue: dayRevenue };
  });

  // Revenue by product (pie)
  const productSales = {};
  completedOrders.forEach(o => {
    const key = o.product_name || 'Unknown';
    if (!productSales[key]) productSales[key] = { name: key, value: 0, orders: 0 };
    productSales[key].value += o.vendor_payout || 0;
    productSales[key].orders++;
  });
  const pieData = Object.values(productSales).sort((a, b) => b.value - a.value).slice(0, 6);

  // Product bar chart
  const productBar = products.slice(0, 8).map(p => ({
    name: (p.name || '').substring(0, 12),
    sales: p.total_sales || 0,
    revenue: p.total_revenue || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your store performance data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue (₦)" value={formatNGN(totalRevenue)} icon={TrendingUp} color="#81C14B" />
        <KpiCard title="Completed Orders" value={totalOrders} icon={ShoppingBag} color="#F4A300" />
        <KpiCard title="Products Listed" value={products.length} icon={Package} color="#715AFF" />
        <KpiCard title="Active Affiliates" value={activeAffiliates} icon={Users} color="#001845" />
      </div>

      {/* 30-day Revenue Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">30-Day Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30}>
                <defs>
                  <linearGradient id="rev30" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#81C14B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#81C14B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatNGN(v, true)} />
                <Tooltip formatter={v => formatNGN(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#81C14B" fill="url(#rev30)" strokeWidth={2} name="Revenue (₦)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Revenue by Product Pie */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Revenue by Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatNGN(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Sales Bar */}
        {productBar.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Product Sales Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productBar}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#F4A300" radius={[4, 4, 0, 0]} name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* KPI Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#81C14B]">{totalOrders > 0 ? formatNGN(totalRevenue / totalOrders) : '₦0'}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Order Value</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#F4A300]">{totalOrders > 0 ? `${((affiliateSales / totalOrders) * 100).toFixed(0)}%` : '0%'}</p>
              <p className="text-xs text-muted-foreground mt-1">Affiliate-Driven Sales</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#715AFF]">{products.filter(p => p.status === 'approved').length}</p>
              <p className="text-xs text-muted-foreground mt-1">Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#001845]">{orders.filter(o => o.status === 'refunded').length}</p>
              <p className="text-xs text-muted-foreground mt-1">Refunds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}