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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { formatUSD as formatNGN } from '@/lib/currency'
import api from '@/api/http-client'
import { Eye } from 'lucide-react'

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

/** Parse payoutDetails which may be a JSON string or a plain string */
function parsePayoutDetails(raw: string): Record<string, string> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string>
    }
  } catch {
    // not JSON — return as single value
  }
  return { Details: raw }
}

/** Human-readable label for a camelCase/snake_case key */
function labelKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminPayouts(props: AdminPayoutsProps) {
  const [payouts, setPayouts] = useState(props.payouts)
  const [statusFilter, setStatusFilter] = useState('all')
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [viewPayout, setViewPayout] = useState<PayoutRow | null>(null)

  const updatePayout = async (id: number, status: 'approved' | 'paid' | 'rejected') => {
    try {
      const res = await api.put(`/api/payouts/${id}`, {
        status,
        adminNotes: notes[id] || undefined,
      })
      setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, ...res.data.data, status } : p)))
      toast.success(`Payout ${status}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update payout')
    }
  }

  const retryTransfer = async (payoutId: number) => {
    try {
      const response = await api.post(`/api/admin/payouts/${payoutId}/retry-transfer`)
      
      if (response.data.success) {
        toast.success('Transfer retry initiated successfully!')
        // Refresh the payout data
        const updatedPayout = payouts.find(p => p.id === payoutId)
        if (updatedPayout) {
          setPayouts(prev => prev.map(p => 
            p.id === payoutId 
              ? { ...p, transferStatus: null, transferErrorMessage: null }
              : p
          ))
        }
      } else {
        toast.error(`Failed to retry transfer: ${response.data.message}`)
      }
    } catch (error: any) {
      console.error('Error retrying transfer:', error)
      toast.error(error?.response?.data?.message || 'Error retrying transfer')
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
                  {filtered.map((p) => {
                    const details = parsePayoutDetails(p.payoutDetails)
                    // Show at most the first two fields inline; full view via modal
                    const inlineEntries = details ? Object.entries(details).slice(0, 2) : []

                    return (
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
                          <div className="text-xs space-y-0.5">
                            {inlineEntries.map(([key, val]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">{labelKey(key)}: </span>
                                <span className="font-medium">{String(val)}</span>
                              </div>
                            ))}
                            {details && Object.keys(details).length > 2 && (
                              <span className="text-muted-foreground italic">
                                +{Object.keys(details).length - 2} more…
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 mt-1 px-2 gap-1"
                            onClick={() => setViewPayout(p)}
                          >
                            <Eye className="w-3 h-3" /> View
                          </Button>
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
                                {p.status === 'approved' && p.transferStatus === 'failed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 text-orange-600 border-orange-300 hover:bg-orange-50"
                                    onClick={() => retryTransfer(p.id)}
                                  >
                                    Retry Transfer
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
                              {p.processedAt
                                ? format(new Date(p.processedAt), 'MMM d, yyyy')
                                : '—'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10">No payout requests</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal */}
      <Dialog open={!!viewPayout} onOpenChange={() => setViewPayout(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
          </DialogHeader>
          {viewPayout && (() => {
            const details = parsePayoutDetails(viewPayout.payoutDetails)
            return (
              <div className="space-y-4 text-sm">
                {/* User info */}
                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <p>
                    <span className="text-muted-foreground">User: </span>
                    <strong>{viewPayout.user?.fullName || '—'}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    {viewPayout.user?.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Role: </span>
                    <span className="capitalize">{viewPayout.user?.role}</span>
                  </p>
                </div>

                {/* Payout summary */}
                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <p>
                    <span className="text-muted-foreground">Amount: </span>
                    <strong className="text-green-600">{formatNGN(viewPayout.amount)}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Method: </span>
                    <span className="capitalize">{viewPayout.payoutMethod.replace(/_/g, ' ')}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    <Badge variant={statusColors[viewPayout.status] ?? 'outline'} className="text-xs">
                      {viewPayout.status}
                    </Badge>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Requested: </span>
                    {format(new Date(viewPayout.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                  {viewPayout.processedAt && (
                    <p>
                      <span className="text-muted-foreground">Processed: </span>
                      {format(new Date(viewPayout.processedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>

                {/* Payout account details */}
                {details && (
                  <div>
                    <p className="font-semibold mb-2">Account / Payment Details</p>
                    <div className="bg-slate-50 border rounded-lg p-3 space-y-2">
                      {Object.entries(details).map(([key, val]) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">{labelKey(key)}</span>
                          <span className="font-medium text-right break-all">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin notes */}
                {viewPayout.adminNotes && (
                  <div>
                    <p className="font-semibold mb-1">Admin Notes</p>
                    <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                      {viewPayout.adminNotes}
                    </p>
                  </div>
                )}

                {/* Transfer Status (for bank transfers) */}
                {viewPayout.payoutMethod === 'bank_transfer' && (viewPayout as any).transferStatus && (
                  <div>
                    <p className="font-semibold mb-2">Paystack Transfer Status</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transfer Status:</span>
                        <span className={`font-medium capitalize ${
                          (viewPayout as any).transferStatus === 'success' ? 'text-green-600' :
                          (viewPayout as any).transferStatus === 'failed' || (viewPayout as any).transferStatus === 'reversed' ? 'text-red-600' :
                          'text-amber-600'
                        }`}>
                          {(viewPayout as any).transferStatus}
                        </span>
                      </div>
                      {(viewPayout as any).transferReference && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transfer Reference:</span>
                          <span className="font-mono text-xs">{(viewPayout as any).transferReference}</span>
                        </div>
                      )}
                      {(viewPayout as any).transferInitiatedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transfer Initiated:</span>
                          <span>{format(new Date((viewPayout as any).transferInitiatedAt), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      )}
                      {(viewPayout as any).transferCompletedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transfer Completed:</span>
                          <span>{format(new Date((viewPayout as any).transferCompletedAt), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      )}
                      {(viewPayout as any).transferErrorMessage && (
                        <div>
                          <span className="text-muted-foreground">Error:</span>
                          <p className="text-red-600 font-medium mt-1">{(viewPayout as any).transferErrorMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
