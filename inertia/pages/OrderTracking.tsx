import React, { useState } from 'react'
import SEO from '@/components/SEO'
import PublicLayout from '@/components/layout/PublicLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Package,
  Mail,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Store,
  Calendar,
  CreditCard,
  Copy,
  Check,
  MapPin,
  Phone,
} from 'lucide-react'

interface OrderTrackingProps {
  supportEmail: string
}

interface OrderData {
  id: number
  orderNumber: string
  buyerEmail: string
  amount: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'processing'
  paymentMethod: string | null
  currency: string
  quantity?: number | null
  createdAt: string
  shippingDetails?: string | null
  product?: {
    id: number
    name: string
    productType: string
    imageUrl?: string | null
    description?: string | null
  } | null
  digitalAsset?: {
    url: string
    name: string
  } | null
  vendor?: {
    fullName?: string
    businessName?: string
    email?: string
    phone?: string
    location?: string
  } | null
  supportEmail?: string
}

export default function OrderTracking({ supportEmail = 'support@plentyvalue.com' }: OrderTrackingProps) {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Load query parameters on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const orderNumberParam = urlParams.get('orderNumber')
    const emailParam = urlParams.get('email')

    if (orderNumberParam) {
      setOrderNumber(orderNumberParam)
    }
    if (emailParam) {
      setEmail(emailParam)
    }

    // Auto-search if both parameters are present
    if (orderNumberParam && emailParam) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        handleSearch(null, orderNumberParam, emailParam)
      }, 100)
    }
  }, [])

  const activeSupportEmail = order?.supportEmail || supportEmail

  const handleSearch = async (e?: React.FormEvent | null, orderNumParam?: string, emailParam?: string) => {
    if (e) e.preventDefault()

    const searchOrderNumber = orderNumParam || orderNumber.trim()
    const searchEmail = emailParam || email.trim()

    if (!searchOrderNumber || !searchEmail) {
      setError('Please enter both your Order Number and Email Address.')
      return
    }

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: searchOrderNumber,
          email: searchEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'No order found matching the provided order number and email address.')
      } else {
        setOrder(data.data)
      }
    } catch (err) {
      setError('Failed to query order details. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(activeSupportEmail)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <Package className="w-4 h-4 text-blue-500" /> Processing
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Payment Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-500" /> Cancelled
          </Badge>
        )
      case 'refunded':
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-purple-500" /> Refunded
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1 text-sm font-semibold">
            {status}
          </Badge>
        )
    }
  }

  const parseShippingDetails = (rawDetails?: string | null) => {
    if (!rawDetails) return null
    try {
      return typeof rawDetails === 'string' ? JSON.parse(rawDetails) : rawDetails
    } catch {
      return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <SEO
        title="Track Your Order — Plenty Value"
        description="Check your order status, download purchased digital assets, view fulfillment progress, or reach support for assistance."
      />

      {/* Header Banner */}
      <section
        style={{ backgroundColor: '#001845' }}
        className="text-white py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4">
            <Package className="w-6 h-6" style={{ color: '#81C14B' }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-3">
            Track Your Order
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto">
            Enter your order number and the email address used during purchase to look up your order
            status and access downloads.
          </p>
        </div>
      </section>

      {/* Main Search Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <Card className="shadow-xl border-0 text-white" style={{ backgroundColor: '#001845' }}>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white block">Order Number</label>
                  <Input
                    type="text"
                    placeholder="e.g. ORD-17684920"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="h-11 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-[#81C14B] focus:ring-[#81C14B]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-[#81C14B] focus:ring-[#81C14B]"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-400/40 text-white text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-300" />
                  <span className="text-white font-medium">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-white font-bold flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md"
                style={{ backgroundColor: '#81C14B' }}
              >
                {loading ? (
                  <span className="text-white font-semibold">Searching Order...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-white" />{' '}
                    <span className="text-white">Track Order Status</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details Result */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Status Header Card */}
            <Card className="border shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="border-b dark:border-slate-700 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Order Reference
                    </span>
                    <CardTitle className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                      #{order.orderNumber}
                    </CardTitle>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Product Summary */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-4">
                  <div className="flex items-center gap-4">
                    {order.product?.imageUrl ? (
                      <img
                        src={order.product.imageUrl}
                        alt={order.product.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                        {order.product?.name || 'Product'}
                        {(order.quantity ?? 1) > 1 && (
                          <span className="ml-2 text-base font-normal text-muted-foreground">
                            ×{order.quantity}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        Type: {order.product?.productType || 'Standard'} Product
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-xs text-muted-foreground">Total Paid</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {order.currency === 'NGN' ? '₦' : '$'}
                      {Number(order.amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Digital Asset Access */}
                {order.status === 'completed' && order.digitalAsset?.url && (
                  <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <Download className="w-5 h-5 text-emerald-600" /> Digital Product Download
                          Ready
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                          You can download your digital file ({order.digitalAsset.name}) instantly
                          below.
                        </p>
                      </div>
                      <a
                        href={order.digitalAsset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold shadow-sm transition-transform active:scale-95 text-sm"
                        style={{ backgroundColor: '#81C14B' }}
                      >
                        <Download className="w-4 h-4" /> Download File
                      </a>
                    </div>
                  </div>
                )}

                {/* Order Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-y dark:border-slate-700 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5" /> Date Purchased
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Package className="w-3.5 h-3.5" /> Units Ordered
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {order.quantity ?? 1}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <CreditCard className="w-3.5 h-3.5" /> Payment Method
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {order.paymentMethod || 'Online Gateway'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Mail className="w-3.5 h-3.5" /> Buyer Email
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {order.buyerEmail}
                    </p>
                  </div>
                </div>

                {/* Physical Shipping Details (if applicable) */}
                {parseShippingDetails(order.shippingDetails) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-500" /> Delivery Shipping Details
                    </h4>
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs space-y-1 text-slate-700 dark:text-slate-300 border">
                      {(() => {
                        const details = parseShippingDetails(order.shippingDetails)
                        return (
                          <>
                            {details.fullName && (
                              <p>
                                <strong>Recipient:</strong> {details.fullName}
                              </p>
                            )}
                            {details.phone && (
                              <p>
                                <strong>Phone:</strong> {details.phone}
                              </p>
                            )}
                            {details.address && (
                              <p>
                                <strong>Address:</strong> {details.address}
                              </p>
                            )}
                            {(details.city || details.state || details.country) && (
                              <p>
                                <strong>Location:</strong>{' '}
                                {[details.city, details.state, details.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Seller Contact Info (if available) */}
                {order.vendor && (
                  <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <Store className="w-4 h-4 text-blue-600" /> Seller Information
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      {order.vendor.businessName && (
                        <p>
                          <strong>Business:</strong> {order.vendor.businessName}
                        </p>
                      )}
                      {order.vendor.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a
                            href={`mailto:${order.vendor.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {order.vendor.email}
                          </a>
                        </p>
                      )}
                      {order.vendor.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {order.vendor.phone}
                        </p>
                      )}
                      {order.vendor.location && (
                        <p>
                          <strong>Location:</strong> {order.vendor.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Support & Complaints Card */}
        <Card className="mt-8 border-0 shadow-xl text-white" style={{ backgroundColor: '#001845' }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white">
                <HelpCircle className="w-5 h-5" style={{ color: '#81C14B' }} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">
                  Need Help or Have a Complaint?
                </CardTitle>
                <CardDescription className="text-xs text-slate-300">
                  Our customer support team is available to assist with order issues, refunds, or
                  product inquiries.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-white/10 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white/80" />
                <div>
                  <span className="text-xs text-white/70 font-medium block">
                    Official Customer Support Email
                  </span>
                  <a
                    href={`mailto:${activeSupportEmail}?subject=Complaint/Inquiry regarding Order ${orderNumber ? '#' + orderNumber : ''}`}
                    className="text-base font-bold text-white hover:underline transition-colors"
                  >
                    {activeSupportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="gap-1.5 text-xs font-bold text-white border border-white/30 bg-white/15 hover:bg-white/25 transition-colors"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white" />
                  )}
                  <span className="text-white">{copiedEmail ? 'Copied Email' : 'Copy Email'}</span>
                </Button>
                <a
                  href={`mailto:${activeSupportEmail}?subject=Inquiry regarding Order ${orderNumber ? '#' + orderNumber : ''}`}
                  className="px-4 py-2 rounded-lg text-white font-bold text-xs transition-opacity hover:opacity-90 inline-flex items-center gap-1.5 shadow-sm"
                  style={{ backgroundColor: '#81C14B' }}
                >
                  <Mail className="w-3.5 h-3.5 text-white" />{' '}
                  <span className="text-white">Email Support</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

OrderTracking.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
