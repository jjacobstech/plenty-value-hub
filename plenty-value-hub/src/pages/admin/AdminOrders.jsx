import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatUSD as formatNGN } from '@/lib/currency';

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminUpdateOrder', { order_id: id, status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update order');
    },
  });

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const statusColors = { pending: 'secondary', completed: 'default', refunded: 'destructive', cancelled: 'outline' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage marketplace transactions</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
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
                  <TableCell className="font-mono text-xs">{o.order_number || o.id?.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{o.product_name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(o.created_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{formatNGN(o.amount)}</TableCell>
                  <TableCell className="text-green-600">{formatNGN(o.commission_amount)}</TableCell>
                  <TableCell>{formatNGN(o.platform_fee)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[o.status] || 'secondary'} className="text-xs capitalize">{o.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={v => updateMutation.mutate({ id: o.id, data: { status: v } })}>
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
  );
}