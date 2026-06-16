import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUSD as formatNGN } from '@/lib/currency';
import { format } from 'date-fns';
import { Wallet, Clock, CheckCircle2, Download, Banknote } from 'lucide-react';
import { toast } from 'sonner';

type AffiliateEarningsProps = {
  earnings: any
}


export default function AffiliateEarnings(props: AffiliateEarningsProps) {
  const { earnings } = props
  const [user, setUser] = useState(null);
  useEffect(() => { [].then(setUser); }, []);



  const totalEarnings = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.commission_amount || 0), 0);
  const pendingEarnings = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + (o.commission_amount || 0), 0);
  const totalFromLinks = links.reduce((sum, l) => sum + (l.commission_earned || 0), 0);

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
          <h1 className="text-2xl font-bold">Commissions & Payouts</h1>
          <p className="text-muted-foreground text-sm">Track your affiliate earnings in USD</p>
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
            <p className="text-3xl font-bold text-green-600">{formatNGN(totalEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmed commissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-100"><Clock className="w-5 h-5 text-amber-600" /></div>
              <span className="text-sm text-muted-foreground font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">{formatNGN(pendingEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting order confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-[#715AFF]/10"><Banknote className="w-5 h-5 text-[#715AFF]" /></div>
              <span className="text-sm text-muted-foreground font-medium">All-time Links Earned</span>
            </div>
            <p className="text-3xl font-bold text-[#715AFF]">{formatNGN(totalFromLinks)}</p>
            <p className="text-xs text-muted-foreground mt-1">From all affiliate links</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Methods */}
      <Card className="border-[#715AFF]/30 bg-[#715AFF]/5">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-2">💰 Withdrawal Methods (USD)</h3>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="bg-white px-3 py-1 rounded-full border">🏦 Bank Transfer</span>
            <span className="bg-white px-3 py-1 rounded-full border">💳 Paystack</span>
            <span className="bg-white px-3 py-1 rounded-full border">💸 Flutterwave</span>
            <span className="bg-white px-3 py-1 rounded-full border">📱 OPay / Kuda</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Minimum withdrawal: $10. Contact support to configure your payout account.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Commission History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sale Amount ($)</TableHead>
                  <TableHead>Commission ($)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.product_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(order.created_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatNGN(order.amount)}</TableCell>
                    <TableCell className="text-green-600 font-semibold">{formatNGN(order.commission_amount)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-10">No earnings yet. Start promoting products!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


