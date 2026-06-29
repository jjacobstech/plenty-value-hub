import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatUSD as formatNGN } from '@/lib/currency';
import api from '@/api/http-client';

type AdminOrdersProps = {
  orders: any[]
}

export default function AdminOrders(props: AdminOrdersProps) {
  const [orders, setOrders] = useState(props.orders)
  const [statusFilter, setStatusFilter] = useState('all');

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/api/orders/${id}`, { status })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Order updated')
    } catch {
      toast.error('Failed to update order')
    }
  }

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const statusColors: Record<string, string> = { pending: 'secondary', completed: 'default', refunded: 'destructive', cancelled: 'outline' };

  return (
    <DashboardLayout role="admin">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage marketplace transactions</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.orderNumber || String(o.id).slice(-8)}</TableCell>
                  <TableCell className="font-medium">{o.productName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(o.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{formatNGN(o.amount)}</TableCell>
                  <TableCell className="text-green-600">{formatNGN(o.commissionAmount)}</TableCell>
                  <TableCell>{formatNGN(o.platformFee)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[o.status] as any ?? 'secondary'} className="text-xs capitalize">{o.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
