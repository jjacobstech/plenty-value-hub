import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle, Edit2, Trash2, Plus, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/api/http-client'

const SUPPORTED_GATEWAYS = [
  { id: 'manual', name: 'Manual / Offline', color: 'text-emerald-600', icon: '/icons/manual-bank.svg' },
  { id: 'paystack', name: 'Paystack', color: 'text-blue-600', icon: '/icons/paystack-logo.svg' },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    color: 'text-purple-600',
    icon: '/icons/flutterwave-logo.svg',
  },
  { id: 'stripe', name: 'Stripe', color: 'text-indigo-600', icon: '/icons/stripe-logo.svg' },
  { id: 'paypal', name: 'PayPal', color: 'text-blue-700', icon: '/icons/paypal-logo.svg' },
]

type GatewayConfig = {
  id: number
  gateway: string
  isActive: boolean
  merchantId: string | null
  hasPublicKey: boolean
  hasSecretKey: boolean
  hasWebhookSecret: boolean
  createdAt: string
  updatedAt: string
}

type FormData = {
  gateway: string
  publicKey: string
  secretKey: string
  merchantId: string
  webhookSecret: string
  isActive: boolean
  currency?: string
  activeProvider?: string
}

export default function AdminPaymentSettings() {
  const [gateways, setGateways] = useState<GatewayConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    gateway: '',
    publicKey: '',
    secretKey: '',
    merchantId: '',
    webhookSecret: '',
    isActive: true,
  })

  useEffect(() => {
    loadGateways()
    loadSystemSettings()
  }, [])

  const loadSystemSettings = async () => {
    try {
      const { data } = await api.get<{ currency?: string; activeProvider?: string }>('/api/payment-settings')
      if (data) {
        setForm((prev) => ({
          ...prev,
          currency: data.currency || 'USD',
          activeProvider: data.activeProvider || 'manual',
        }))
      }
    } catch (err) {
      console.error('Failed to load site payment settings:', err)
    }
  }

  const loadGateways = async () => {
    try {
      setLoading(true)
      const { data } = await api.get<{ success: boolean; data: GatewayConfig[] }>(
        '/api/payment-gateway-settings'
      )
      setGateways(data.data || [])
    } catch (err) {
      toast.error('Failed to load payment settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (gateway: GatewayConfig) => {
    setEditingId(gateway.id)
    setForm({
      gateway: gateway.gateway,
      publicKey: gateway.gateway === 'manual' ? 'manual' : '',
      secretKey: gateway.gateway === 'manual' ? 'manual' : '',
      merchantId: gateway.merchantId || '',
      webhookSecret: '',
      isActive: gateway.isActive,
    })
    setShowDialog(true)
  }

  const handleNew = (gatewayId: string) => {
    setEditingId(null)
    setForm({
      gateway: gatewayId,
      publicKey: '',
      secretKey: '',
      merchantId: '',
      webhookSecret: '',
      isActive: true,
    })
    setShowDialog(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const isManualGateway = form.gateway === 'manual'
      if (!isManualGateway && (!form.publicKey || !form.secretKey)) {
        toast.error('Public key and secret key are required')
        setSaving(false)
        return
      }

      const endpoint = editingId && editingId > 0
        ? `/api/payment-gateway-settings/${form.gateway}`
        : '/api/payment-gateway-settings'
      const method = editingId && editingId > 0 ? 'put' : 'post'

      const { data } = await api[method]<{ success: boolean; data: any }>(endpoint, {
        gateway: form.gateway,
        publicKey: form.publicKey,
        secretKey: form.secretKey,
        merchantId: form.merchantId || null,
        webhookSecret: form.webhookSecret || null,
        isActive: form.isActive,
      })

      if (data.success) {
        toast.success(data.message || 'Payment settings saved successfully')
        await loadGateways()
        setShowDialog(false)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save payment settings')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (gateway: GatewayConfig) => {
    if (!confirm(`Are you sure you want to delete settings for ${gateway.gateway}?`)) {
      return
    }

    try {
      const { data } = await api.delete<{ success: boolean }>(
        `/api/payment-gateway-settings/${gateway.gateway}`
      )
      if (data.success) {
        toast.success('Payment settings deleted')
        await loadGateways()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete payment settings')
    }
  }

  const handleToggle = async (gateway: GatewayConfig) => {
    try {
      const { data } = await api.patch<{ success: boolean; data: { isActive: boolean } }>(
        `/api/payment-gateway-settings/${gateway.gateway}/toggle`
      )
      if (data.success) {
        toast.success(`${gateway.gateway} is now ${data.data.isActive ? 'active' : 'inactive'}`)
        await loadGateways()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to toggle gateway status')
    }
  }

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getGatewayInfo = (gatewayId: string) => {
    return SUPPORTED_GATEWAYS.find((g) => g.id === gatewayId)
  }

  const getConfiguredGateway = (gatewayId: string) => {
    return gateways.find((g) => g.gateway === gatewayId)
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Payment Gateway Settings</h1>
            <p className="text-muted-foreground text-sm">
              Configure and manage payment gateway credentials and system default currency
            </p>
          </div>
        </div>

        {/* Currency & General Settings Card */}
        <Card className="border border-gray-200">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-base">System Settings (Currency & Default Provider)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Platform System Currency</Label>
                <select
                  value={form.currency || 'USD'}
                  onChange={async (e) => {
                    const newCurrency = e.target.value
                    setForm((prev) => ({ ...prev, currency: newCurrency }))
                    try {
                      await api.post('/api/site-settings', {
                        key: 'payment_settings',
                        label: 'Payment Settings',
                        value: { currency: newCurrency, activeProvider: form.activeProvider || 'manual' },
                      })
                      toast.success(`System currency updated to ${newCurrency}`)
                    } catch {
                      toast.error('Failed to update currency')
                    }
                  }}
                  className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm bg-white"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="NGN">NGN (₦) - Nigerian Naira</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="KES">KES (KSh) - Kenyan Shilling</option>
                  <option value="GHS">GHS (GH₵) - Ghanaian Cedi</option>
                  <option value="CAD">CAD (CA$) - Canadian Dollar</option>
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  All store checkout amounts and calculations will use this selected currency.
                </p>
              </div>

              <div>
                <Label className="text-sm">Primary Default Provider</Label>
                <select
                  value={form.activeProvider || 'manual'}
                  onChange={async (e) => {
                    const newProvider = e.target.value
                    setForm((prev) => ({ ...prev, activeProvider: newProvider }))
                    try {
                      await api.post('/api/site-settings', {
                        key: 'payment_settings',
                        label: 'Payment Settings',
                        value: { currency: form.currency || 'USD', activeProvider: newProvider },
                      })
                      toast.success(`Default provider updated to ${newProvider}`)
                    } catch {
                      toast.error('Failed to update active provider')
                    }
                  }}
                  className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm bg-white"
                >
                  {SUPPORTED_GATEWAYS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Default selected provider for new checkout transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Info */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Secure Storage</p>
              <p className="mt-1">
                All payment credentials are encrypted and stored securely in the database. Keys are
                never displayed after creation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gateway Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORTED_GATEWAYS.map((gateway) => {
            const configured = getConfiguredGateway(gateway.id)
            return (
              <Card key={gateway.id} className={configured?.isActive ? 'border-green-300' : ''}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <img src={gateway.icon} alt={gateway.name} className="w-30 h-10 mb-2" />
                        <p className="font-semibold text-sm">{gateway.name}</p>
                      </div>
                      {configured?.isActive && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>

                    {configured ? (
                      <div className="space-y-2 text-xs">
                        <p className="text-muted-foreground">
                          Configured on {new Date(configured.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(configured)}
                            className="flex-1"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(configured)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleNew(gateway.id)}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Configured Gateways Table */}
        {gateways.length > 0 && (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Credentials</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateways.map((gateway) => (
                    <TableRow key={gateway.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium capitalize">{gateway.gateway}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggle(gateway)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition ${gateway.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {gateway.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <div className="flex items-center justify-center gap-1">
                          {gateway.hasPublicKey && <span className="text-green-600">●</span>}
                          {gateway.hasSecretKey && <span className="text-green-600">●</span>}
                          {gateway.hasWebhookSecret && <span className="text-blue-600">●</span>}
                          {!gateway.hasPublicKey && (
                            <span className="text-gray-400 text-xs">Incomplete</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(gateway.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(gateway)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(gateway)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="capitalize">
                {editingId ? `Edit ${form.gateway}` : `Configure ${form.gateway}`}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Public Key */}
              <div>
                <Label className="text-sm">Public Key *</Label>
                <div className="flex gap-2">
                  <Input
                    type={showPassword['publicKey'] ? 'text' : 'password'}
                    value={form.publicKey}
                    onChange={(e) => setForm({ ...form, publicKey: e.target.value })}
                    placeholder="pk_live_xxx or equivalent"
                    required
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setShowPassword((s) => ({
                        ...s,
                        publicKey: !s.publicKey,
                      }))
                    }
                  >
                    {showPassword['publicKey'] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Public/API key from your gateway
                </p>
              </div>

              {/* Secret Key */}
              <div>
                <Label className="text-sm">Secret Key *</Label>
                <div className="flex gap-2">
                  <Input
                    type={showPassword['secretKey'] ? 'text' : 'password'}
                    value={form.secretKey}
                    onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
                    placeholder="sk_live_xxx or equivalent"
                    required
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setShowPassword((s) => ({
                        ...s,
                        secretKey: !s.secretKey,
                      }))
                    }
                  >
                    {showPassword['secretKey'] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Secret/private key (keep safe!)
                </p>
              </div>

              {/* Merchant ID (Optional) */}
              <div>
                <Label className="text-sm">Merchant ID (Optional)</Label>
                <Input
                  type="text"
                  value={form.merchantId}
                  onChange={(e) => setForm({ ...form, merchantId: e.target.value })}
                  placeholder="Merchant ID if applicable"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Required by some gateways</p>
              </div>

              {/* Webhook Secret (Optional) */}
              <div>
                <Label className="text-sm">Webhook Secret (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type={showPassword['webhookSecret'] ? 'text' : 'password'}
                    value={form.webhookSecret}
                    onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
                    placeholder="Webhook signing secret"
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setShowPassword((s) => ({
                        ...s,
                        webhookSecret: !s.webhookSecret,
                      }))
                    }
                  >
                    {showPassword['webhookSecret'] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  For webhook signature verification
                </p>
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="text-sm cursor-pointer">
                  Enable this gateway
                </Label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
