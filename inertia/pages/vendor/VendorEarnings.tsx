import DashboardLayout from '@/components/layout/DashboardLayout'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatUSD as formatNGN } from '@/lib/currency'
import { format } from 'date-fns'
import { Wallet, Clock, CheckCircle2, Download, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '@/api/http-client'

type WalletData = {
  availableBalance: string
  pendingBalance: string
  currency: string
}

type PayoutRequest = {
  id: number
  amount: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  createdAt: string
}

type VendorEarningsProps = {
  user: any
  orders: any[]
  wallet?: WalletData
  transactions?: any[]
  payoutRequests?: PayoutRequest[]
}

export default function VendorEarnings(props: VendorEarningsProps) {
  const { orders, wallet, payoutRequests } = props

  // Use wallet data if available (more accurate), otherwise calculate from orders
  const completedRevenue = wallet
    ? parseFloat(wallet.availableBalance)
    : orders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + (o.vendorPayout || 0), 0)

  const pendingRevenue = wallet
    ? parseFloat(wallet.pendingBalance)
    : orders
        .filter((o) => o.status === 'pending')
        .reduce((sum, o) => sum + (o.vendorPayout || 0), 0)

  const totalCommissions = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.commissionAmount || 0), 0)

  const exportToPDF = () => {
    const doc = new jsPDF()
    const exportDate = format(new Date(), 'MMMM d, yyyy')

    doc.setFontSize(18)
    doc.setTextColor(0, 24, 69)
    doc.text('Vendor Earnings Report', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Exported: ${exportDate}`, 14, 28)

    doc.setFontSize(11)
    doc.setTextColor(30)
    doc.text('Summary', 14, 40)
    doc.setFontSize(10)
    doc.setTextColor(80)
    doc.text(`Total Earned (Confirmed): ${formatNGN(completedRevenue)}`, 14, 48)
    doc.text(`Pending Revenue: ${formatNGN(pendingRevenue)}`, 14, 55)
    doc.text(`Affiliate Commissions Paid: ${formatNGN(totalCommissions)}`, 14, 62)

    autoTable(doc, {
      startY: 72,
      head: [
        [
          'Product',
          'Date',
          'Sale Amount',
          'Platform Fee',
          'Affiliate Comm.',
          'Your Payout',
          'Status',
        ],
      ],
      body: orders.map((o) => [
        o.productName,
        format(new Date(o.createdAt), 'MMM d, yyyy'),
        formatNGN(o.amount),
        formatNGN(o.platformFee),
        formatNGN(o.commissionAmount),
        formatNGN(o.vendorPayout),
        o.status,
      ]),
      headStyles: { fillColor: [0, 24, 69] },
      alternateRowStyles: { fillColor: [245, 250, 245] },
      styles: { fontSize: 8 },
    })

    doc.save(`vendor-earnings-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    toast.success('PDF exported successfully!')
  }

  const handleRequestPayout = async () => {
    const amount = prompt('Enter payout amount (USD):', '$10')
    if (!amount) return

    const parsed = parseFloat(amount.replace('$', '').trim())
    if (!parsed || parsed < 10) {
      toast.error('Minimum payout amount is $10')
      return
    }

    try {
      await api.post('/api/wallet/payouts', { amount: parsed })
      toast.success('Payout request submitted!')
      window.location.reload()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Payout request failed')
    }
  }

  const payoutStatusStyles: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700',
    approved: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const statusStyles: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    refunded: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
  }

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
            <p className="text-muted-foreground text-sm">
              Track your revenue and withdrawal history
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleRequestPayout} className="gap-2 bg-[#81C14B] hover:bg-[#72AA3D]">
              <Banknote className="w-4 h-4" /> Request Payout
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportToPDF}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Total Earned</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{formatNGN(completedRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">Confirmed payouts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-100">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Pending</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{formatNGN(pendingRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-purple-100">
                  <Banknote className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  Affiliate Commissions Paid
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{formatNGN(totalCommissions)}</p>
              <p className="text-xs text-muted-foreground mt-1">Paid to your affiliates</p>
            </CardContent>
          </Card>
        </div>

        {payoutRequests && payoutRequests.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Recent Payout Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="font-semibold">{formatNGN(pr.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(pr.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${payoutStatusStyles[pr.status] ?? 'bg-slate-100 text-slate-600'}`}
                        >
                          {pr.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {props.user?.payoutMethod?.replace('_', ' ') || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="border-[#81C14B]/30 bg-[#81C14B]/5">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#81C14B]" /> Configured Payout Method
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active Method:{' '}
                  <strong className="capitalize text-slate-800">
                    {props.user?.payoutMethod?.replace('_', ' ') || 'Direct Bank Transfer'}
                  </strong>
                </p>
                {props.user?.payoutDetails && (
                  <p className="text-xs font-mono text-slate-600 bg-white/80 p-2 rounded-md border mt-2 max-w-md">
                    {props.user.payoutDetails}
                  </p>
                )}
              </div>
              <a href="/vendor/profile">
                <Button variant="outline" size="sm" className="bg-white text-xs gap-1.5 shrink-0">
                  Update Payout Account
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
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
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.productName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(o.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{formatNGN(o.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatNGN(o.platformFee)}
                      </TableCell>
                      <TableCell className="text-purple-600">
                        {formatNGN(o.commissionAmount)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatNGN(o.vendorPayout)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[o.status] ?? 'bg-slate-100 text-slate-600'}`}
                        >
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
    </DashboardLayout>
  )
}
