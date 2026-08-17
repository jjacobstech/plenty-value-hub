import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { formatUSD as formatNGN } from '@/lib/currency'
import api from '@/api/http-client'

type PayoutRow = {
  id: number
  amount: string
  payoutMethod: string
  payoutDetails: string
  status: string
  adminNotes: string | null
  createdAt: string
  processedAt: string | null
  user: { id: number; fullName: string; email: string; role: string } | null
}

type AdminPayoutsProps = {
  payouts: PayoutRow[]
}

export default function AdminPayouts(props: AdminPayoutsProps) {
  const [payouts, setPayouts] = useState(props.payouts)
  const [statusFilter, setStatusFilter] = useState('all')
  const [notes, setNotes] = useState<Record<number, string>>({})

  const updatePayout = async (id: number, status: 'approved' | 'paid' | 'rejected') => {
    try {
      const res = await api.put(`/api/admin/payouts/${id}`, {
        status,
        adminNotes: notes[id] || undefined,
      })
      setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, ...res.data.data, status } : p)))
      toast.success(`Payout ${status}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update payout')
    }
  }

  const filtered =
    statusFilter === 'all' ? payouts : payouts.filter((p) => p.status === statusFilter)

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    approved: 'default',
    paid: 'default',
    rejected: 'destructive',
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Payout Requests</h1>
            <p className="text-muted-foreground">
              Review and process vendor & affiliate withdrawals
            </p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.user?.fullName || '—'}</p>
                          <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{p.user?.role}</TableCell>
                      <TableCell className="font-semibold">{formatNGN(p.amount)}</TableCell>
                      <TableCell className="capitalize text-sm">
                        {p.payoutMethod.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-xs font-mono truncate" title={p.payoutDetails}>
                          {p.payoutDetails}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(p.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[p.status] ?? 'outline'}>{p.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {p.status === 'pending' || p.status === 'approved' ? (
                          <div className="flex flex-col gap-2 min-w-[180px]">
                            <Textarea
                              placeholder="Admin notes (optional)"
                              className="text-xs h-16"
                              value={notes[p.id] || ''}
                              onChange={(e) =>
                                setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                              }
                            />
                            <div className="flex flex-wrap gap-1">
                              {p.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => updatePayout(p.id, 'approved')}
                                >
                                  Approve
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => updatePayout(p.id, 'paid')}
                              >
                                Mark Paid
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs h-7"
                                onClick={() => updatePayout(p.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {p.processedAt ? format(new Date(p.processedAt), 'MMM d, yyyy') : '—'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10">No payout requests</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
