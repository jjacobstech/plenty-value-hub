import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUSD as formatNGN } from '@/lib/currency';
import { format } from 'date-fns';
import { Wallet, Clock, CheckCircle2, Download, Banknote } from 'lucide-react';
import { toast } from 'sonner';

function SummaryCard({ title, value, icon: Icon, bgClass, textClass }) {
  return (
    <Card>
      <CardContent className={`p-5 ${bgClass} rounded-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textClass} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold mt-1 ${textClass}`}>{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${textClass} opacity-40`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorEarnings() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['vendor-orders', user?.id],
    queryFn: () => base44.entities.Order.filter({ vendor_id: user.id }, '-created_date', 100),
    enabled: !!user,
  });

  const completedRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.vendor_payout || 0), 0);
  const pendingRevenue = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + (o.vendor_payout || 0), 0);
  const totalCommissions = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.commission_amount || 0), 0);

  const statusStyles = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    refunded: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
          <p className="text-muted-foreground text-sm">Track your revenue and withdrawal history</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast.info('Export coming soon')}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-green-100"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
              <span className="text-sm text-muted-foreground font-medium">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatNGN(completedRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmed payouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-100"><Clock className="w-5 h-5 text-amber-600" /></div>
              <span className="text-sm text-muted-foreground font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">{formatNGN(pendingRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-100"><Banknote className="w-5 h-5 text-purple-600" /></div>
              <span className="text-sm text-muted-foreground font-medium">Affiliate Commissions Paid</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{formatNGN(totalCommissions)}</p>
            <p className="text-xs text-muted-foreground mt-1">Paid to your affiliates</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Methods Info */}
      <Card className="border-[#81C14B]/30 bg-[#81C14B]/5">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-2">💰 Payout Methods (USD)</h3>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="bg-white px-3 py-1 rounded-full border">🏦 Bank Transfer</span>
            <span className="bg-white px-3 py-1 rounded-full border">💳 Paystack</span>
            <span className="bg-white px-3 py-1 rounded-full border">💸 Flutterwave</span>
            <span className="bg-white px-3 py-1 rounded-full border">📱 OPay</span>
            <span className="bg-white px-3 py-1 rounded-full border">🟢 Opay / Kuda</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Contact support to set up your withdrawal preferences.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sale Amount ($)</TableHead>
                  <TableHead>Platform Fee ($)</TableHead>
                  <TableHead>Affiliate Comm. ($)</TableHead>
                  <TableHead>Your Payout ($)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.product_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(o.created_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatNGN(o.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatNGN(o.platform_fee)}</TableCell>
                    <TableCell className="text-purple-600">{formatNGN(o.commission_amount)}</TableCell>
                    <TableCell className="font-semibold text-green-600">{formatNGN(o.vendor_payout)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[o.status] || 'bg-slate-100 text-slate-600'}`}>
                        {o.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-10">No earnings yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}