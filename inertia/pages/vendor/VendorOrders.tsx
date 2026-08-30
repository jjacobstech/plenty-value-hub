import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SEO from '@/components/SEO'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Download,
  Search,
  MapPin,
  Mail,
  User,
  Info,
  DollarSign,
  AlertCircle,
  Phone,
  RefreshCw,
} from 'lucide-react'
import { formatUSD as formatNGN } from '@/lib/currency'
import { toast } from 'sonner'
import api from '@/api/http-client'

interface Order {
  id: number
  orderNumber: string
  buyerEmail: string
  amount: string
  vendorPayout: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  paymentMethod: string | null
  currency: string
  quantity?: number | null
  shippingDetails?: string | null
  createdAt: string
  product?: {
    id: number
    name: string
    productType: 'digital' | 'physical' | string
    imageUrl?: string | null
  } | null
}

interface VendorOrdersProps {
  user: any
  orders: Order[]
}

export default function VendorOrders({ user, orders: initialOrders = [] }: VendorOrdersProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedShippingOrder, setSelectedShippingOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await api.put(`/api/orders/${orderId}`, { status: newStatus })
      if (res.data && res.data.success) {
        toast.success(`Order #${orderId} status changed to ${newStatus.toUpperCase()}`)
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        )
        if (selectedShippingOrder?.id === orderId) {
          setSelectedShippingOrder((prev) =>
            prev ? { ...prev, status: newStatus as any } : null
          )
        }
      } else {
        toast.error(res.data?.error || 'Failed to update order status')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  const parseShipping = (details?: string | null) => {
    if (!details) return null
    try {
      return typeof details === 'string' ? JSON.parse(details) : details
    } catch {
      return null
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesType =
      typeFilter === 'all' || (order.product && order.product.productType === typeFilter)

    return matchesSearch && matchesStatus && matchesType
  })

  // Stats calculation
  const totalOrders = orders.length
  const pendingPhysical = orders.filter(
    (o) => o.status === 'pending' && o.product?.productType === 'physical'
  ).length
  const completedOrders = orders.filter((o) => o.status === 'completed').length
  const totalVendorEarned = orders
    .filter((o) => o.status === 'completed')
    .reduce((acc, curr) => acc + Number(curr.vendorPayout || 0), 0)

  return (
    <DashboardLayout role="vendor">
      <SEO
        title="Manage Vendor Orders — Plenty Value"
        description="Track customer orders, update order status, and fulfill physical or digital purchases."
      />

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Title Banner */}
        <div
          className="p-5 md:p-6 rounded-2xl text-white shadow-lg space-y-2"
          style={{ backgroundColor: '#001845' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                Order Fulfillment & Status Tracking
              </h1>
              <p className="text-xs sm:text-sm text-slate-200">
                Manage incoming customer orders, change fulfillment status, and review physical shipping details.
              </p>
            </div>
          </div>
        </div>

        {/* Informational Banner */}
        <div
          className="p-4 rounded-xl text-white shadow-md border border-white/20 text-xs sm:text-sm flex items-start gap-3"
          style={{ backgroundColor: '#001845' }}
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#81C14B' }} />
          <div className="space-y-1">
            <p className="font-bold text-white">Vendor Fulfillment Instructions:</p>
            <p className="text-slate-200">
              • <strong>Digital Products</strong>: Automatically marked as completed upon payment, granting buyers instant access to download.
            </p>
            <p className="text-slate-200">
              • <strong>Physical Goods</strong>: Review buyer shipping information and use the <strong>Status Selection Dropdown</strong> to update order progress to <strong>Completed</strong> once dispatched.
            </p>
          </div>
        </div>

        {/* Stats Grid - Responsive Column Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md text-white" style={{ backgroundColor: '#001845' }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{totalOrders}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Package className="w-5 h-5" style={{ color: '#81C14B' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md text-white" style={{ backgroundColor: '#001845' }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Pending Shipments</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{pendingPhysical}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md text-white" style={{ backgroundColor: '#001845' }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Completed Sales</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{completedOrders}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md text-white" style={{ backgroundColor: '#001845' }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Total Earned</p>
                <p className="text-2xl font-bold text-white mt-1">{formatNGN(totalVendorEarned)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <DollarSign className="w-5 h-5" style={{ color: '#81C14B' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table Controls Card */}
        <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: '#001845' }}>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 w-4 h-4 text-white/70" />
                <Input
                  placeholder="Search Order #, Email, Product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-[#81C14B]"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
                <div className="w-full md:w-[160px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 bg-white/10 border-white/30 text-white focus:border-[#81C14B]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-[160px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-10 bg-white/10 border-white/30 text-white focus:border-[#81C14B]">
                      <SelectValue placeholder="Product Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="physical">Physical Goods</SelectItem>
                      <SelectItem value="digital">Digital Assets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Responsive Orders Mobile Cards View (sm screens) */}
            <div className="block lg:hidden space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const shipping = parseShipping(order.shippingDetails)
                  const isDigital = order.product?.productType === 'digital'
                  const isUpdating = updatingId === order.id

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl bg-white/10 border border-white/20 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <div>
                          <span className="font-mono font-bold text-white text-sm">#{order.orderNumber}</span>
                          <span className="block text-[11px] text-slate-300">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-bold text-base text-emerald-400">
                          {formatNGN(Number(order.vendorPayout || 0))}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.product?.imageUrl ? (
                          <img
                            src={order.product.imageUrl}
                            alt={order.product.name}
                            className="w-12 h-12 object-cover rounded border border-white/20 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-white truncate">{order.product?.name || 'Product'}</p>
                          <p className="text-xs text-slate-300 truncate">{order.buyerEmail}</p>
                          {(order.quantity ?? 1) > 1 && (
                            <p className="text-xs text-emerald-300 font-medium">Qty: {order.quantity}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            disabled={isUpdating}
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                          >
                            <SelectTrigger className="h-9 w-[135px] bg-white/15 border-white/30 text-white font-bold text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white font-semibold">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                          {isUpdating && <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />}
                        </div>

                        {shipping && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedShippingOrder(order)}
                            className="gap-1 text-xs font-bold text-white border-white/30 bg-white/10"
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-300" /> Shipping Info
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 text-slate-300">
                  <Package className="w-10 h-10 mx-auto mb-2 text-white/50" />
                  No customer orders match the selected filters.
                </div>
              )}
            </div>

            {/* Desktop Table View (lg screens and above) */}
            <div className="hidden lg:block border border-white/20 rounded-xl overflow-x-auto bg-slate-900/60">
              <Table>
                <TableHeader className="bg-white/10 border-b border-white/20">
                  <TableRow className="border-b border-white/20 hover:bg-transparent">
                    <TableHead className="font-bold text-white">Order Reference</TableHead>
                    <TableHead className="font-bold text-white">Product</TableHead>
                    <TableHead className="font-bold text-white">Qty</TableHead>
                    <TableHead className="font-bold text-white">Buyer Email</TableHead>
                    <TableHead className="font-bold text-white">Vendor Payout</TableHead>
                    <TableHead className="font-bold text-white">Change Order Status</TableHead>
                    <TableHead className="font-bold text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const shipping = parseShipping(order.shippingDetails)
                      const isDigital = order.product?.productType === 'digital'
                      const isUpdating = updatingId === order.id

                      return (
                        <TableRow key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <TableCell className="font-mono font-bold text-white text-xs">
                            #{order.orderNumber}
                            <span className="block text-[11px] text-slate-300 font-sans mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.product?.imageUrl ? (
                                <img
                                  src={order.product.imageUrl}
                                  alt={order.product.name}
                                  className="w-9 h-9 object-cover rounded border border-white/20"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded bg-white/10 flex items-center justify-center text-white/60">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-sm text-white block">
                                  {order.product?.name || 'Product'}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase tracking-wider py-0 border-white/30 text-white"
                                >
                                  {isDigital ? (
                                    <span className="flex items-center gap-1 text-emerald-400">
                                      <Download className="w-2.5 h-2.5" /> Digital
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-amber-300">
                                      <Truck className="w-2.5 h-2.5" /> Physical
                                    </span>
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-bold text-white text-center">
                            {order.quantity ?? 1}
                          </TableCell>

                          <TableCell className="text-sm font-medium text-white">
                            <span className="flex items-center gap-1.5 text-white">
                              <Mail className="w-3.5 h-3.5 text-white/70" />
                              {order.buyerEmail}
                            </span>
                          </TableCell>

                          <TableCell className="font-bold text-sm text-white">
                            {formatNGN(Number(order.vendorPayout || 0))}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={order.status}
                                disabled={isUpdating}
                                onValueChange={(val) => handleStatusChange(order.id, val)}
                              >
                                <SelectTrigger
                                  className="h-9 w-[145px] bg-white/10 border-white/30 text-white font-bold text-xs focus:border-[#81C14B]"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white font-semibold">
                                  <SelectItem value="pending">
                                    <span className="flex items-center gap-1.5 text-amber-400">
                                      <Clock className="w-3.5 h-3.5" /> Pending
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    <span className="flex items-center gap-1.5 text-emerald-400">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    <span className="flex items-center gap-1.5 text-red-400">
                                      <XCircle className="w-3.5 h-3.5" /> Cancelled
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="refunded">
                                    <span className="flex items-center gap-1.5 text-purple-400">
                                      <AlertCircle className="w-3.5 h-3.5" /> Refunded
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              {isUpdating && <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {shipping && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedShippingOrder(order)}
                                  className="gap-1.5 text-xs font-bold text-white border-white/30 bg-white/10 hover:bg-white/20"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-amber-300" /> Shipping Info
                                </Button>
                              )}

                              {isDigital && (
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold">
                                  Auto-Fulfilled
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-300">
                        <Package className="w-10 h-10 mx-auto mb-2 text-white/50" />
                        No customer orders match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Address Dialog */}
      <Dialog
        open={Boolean(selectedShippingOrder)}
        onOpenChange={(open) => !open && setSelectedShippingOrder(null)}
      >
        <DialogContent className="max-w-md text-white border-0 shadow-2xl" style={{ backgroundColor: '#001845' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white font-bold">
              <MapPin className="w-5 h-5" style={{ color: '#81C14B' }} /> Shipping Delivery Address
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs">
              Order #{selectedShippingOrder?.orderNumber} — Physical Goods Dispatch
            </DialogDescription>
          </DialogHeader>

          {selectedShippingOrder && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 space-y-2 text-sm text-white">
                {(() => {
                  const details = parseShipping(selectedShippingOrder.shippingDetails)
                  if (!details)
                    return <p className="text-slate-300">No detailed shipping info provided.</p>

                  return (
                    <>
                      {details.fullName && (
                        <p className="flex items-center gap-2 font-bold text-white">
                          <User className="w-4 h-4 text-white/70" /> Recipient: {details.fullName}
                        </p>
                      )}
                      {details.phone && (
                        <p className="flex items-center gap-2 text-slate-200">
                          <Phone className="w-4 h-4 text-white/70" /> Phone: {details.phone}
                        </p>
                      )}
                      {details.address && (
                        <p className="text-slate-200">
                          <strong>Address:</strong> {details.address}
                        </p>
                      )}
                      {(details.city || details.state || details.country) && (
                        <p className="text-slate-200">
                          <strong>Location:</strong>{' '}
                          {[details.city, details.state, details.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </>
                  )
                })()}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">Update Order Status:</label>
                <Select
                  value={selectedShippingOrder.status}
                  disabled={updatingId === selectedShippingOrder.id}
                  onValueChange={(val) => handleStatusChange(selectedShippingOrder.id, val)}
                >
                  <SelectTrigger className="w-full h-10 bg-white/10 border-white/30 text-white font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed (Shipped)</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedShippingOrder.status === 'pending' && (
                <Button
                  onClick={() => handleStatusChange(selectedShippingOrder.id, 'completed')}
                  disabled={updatingId === selectedShippingOrder.id}
                  className="w-full text-white font-bold flex items-center justify-center gap-2 mt-3"
                  style={{ backgroundColor: '#81C14B' }}
                >
                  <Truck className="w-4 h-4 text-white" /> Confirm Dispatch & Mark Completed
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
