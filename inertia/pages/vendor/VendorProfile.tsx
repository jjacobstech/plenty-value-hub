import DashboardLayout from '@/components/layout/DashboardLayout'
import ImageUploadField from '@/components/ImageUploadField'
import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Store,
  Globe,
  Mail,
  AtSign,
  Phone,
  MapPin,
  CheckCircle2,
  Edit2,
  Save,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/api/http-client'
import { PAYOUT_METHODS, MOBILE_MONEY_PROVIDERS } from '@/constants/payout-methods'

type VendorProfileProps = {
  user: any
  paymentConfig?: {
    providers?: Array<{ key: string; label: string; enabled: boolean }>
  }
}

export default function VendorProfile(props: VendorProfileProps) {
  const { user, paymentConfig: initialConfig } = props
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<
    Array<{ key: string; label: string }>
  >(initialConfig?.providers || [])

  // Remove refs and cleanup code
  useEffect(() => {
    if (!availableProviders.length) {
      api
        .get('/api/payments/config')
        .then((res) => {
          if (res.data?.providers) {
            setAvailableProviders(res.data.providers)
          }
        })
        .catch(() => {})
    }
  }, [availableProviders.length])

  const [form, setForm] = useState({
    businessName: user?.businessName || '',
    businessDescription: user?.businessDescription || '',
    phone: user?.phone || '',
    website: user?.website || '',
    instagram: user?.instagram || '',
    twitter: user?.twitter || '',
    location: user?.location || '',
    businessLogo: user?.businessLogo || '',
    coverBanner: user?.coverBanner || '',
    productCategories: user?.productCategories || '',
    payoutMethod: user?.payoutMethod || 'bank',
    // Bank Transfer fields
    payoutBankName: user?.payoutBankName || '',
    payoutAccountNumber: user?.payoutAccountNumber || '',
    payoutAccountName: user?.payoutAccountName || '',
    // Mobile Money fields
    payoutMobileProvider: user?.payoutMobileProvider || '',
    payoutMobileNumber: user?.payoutMobileNumber || '',
    // PayPal/Stripe/Other
    payoutEmail: user?.payoutEmail || '',
    payoutAccountId: user?.payoutAccountId || '',
  })

  useEffect(() => {
    setForm({
      businessName: user?.businessName || '',
      businessDescription: user?.businessDescription || '',
      phone: user?.phone || '',
      website: user?.website || '',
      instagram: user?.instagram || '',
      twitter: user?.twitter || '',
      location: user?.location || '',
      businessLogo: user?.businessLogo || '',
      coverBanner: user?.coverBanner || '',
      productCategories: user?.productCategories || '',
      payoutMethod: user?.payoutMethod || 'bank',
      payoutBankName: user?.payoutBankName || '',
      payoutAccountNumber: user?.payoutAccountNumber || '',
      payoutAccountName: user?.payoutAccountName || '',
      payoutMobileProvider: user?.payoutMobileProvider || '',
      payoutMobileNumber: user?.payoutMobileNumber || '',
      payoutEmail: user?.payoutEmail || '',
      payoutAccountId: user?.payoutAccountId || '',
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/api/profile/vendor', {
        businessName: form.businessName || undefined,
        businessDescription: form.businessDescription || undefined,
        phone: form.phone || undefined,
        website: form.website || undefined,
        instagram: form.instagram || undefined,
        twitter: form.twitter || undefined,
        location: form.location || undefined,
        businessLogo: form.businessLogo || undefined,
        coverBanner: form.coverBanner || undefined,
        productCategories: form.productCategories || undefined,
        payoutMethod: form.payoutMethod || undefined,
        payoutBankName: form.payoutBankName || undefined,
        payoutAccountNumber: form.payoutAccountNumber || undefined,
        payoutAccountName: form.payoutAccountName || undefined,
        payoutMobileProvider: form.payoutMobileProvider || undefined,
        payoutMobileNumber: form.payoutMobileNumber || undefined,
        payoutEmail: form.payoutEmail || undefined,
        payoutAccountId: form.payoutAccountId || undefined,
      })
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch {
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="w-6 h-6 text-[#81C14B]" />
              Seller Profile
            </h1>
            <p className="text-muted-foreground text-sm">Your public seller page on Plenty Value</p>
          </div>
          <Button
            variant={editing ? 'default' : 'outline'}
            onClick={editing ? handleSave : () => setEditing(true)}
            disabled={saving}
            style={editing ? { backgroundColor: '#001845', color: '#fff' } : {}}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : editing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          {/* Cover Banner - Show as editable section when editing */}
          {editing ? (
            <div className="p-4 bg-blue-50 border-b">
              <ImageUploadField
                label="Cover Banner"
                value={form.coverBanner}
                onChange={(url) => setForm({ ...form, coverBanner: url || '' })}
                endpoint="/api/uploads/profile-image"
                formDataExtra={{ type: 'cover_banner' }}
                showPreview={true}
                helpText="Recommended: 1200x400px, max 10MB"
              />
            </div>
          ) : (
              <div
                className="h-36 relative bg-cover bg-center"
                style={{
                  backgroundImage: form.coverBanner ? `url('${form.coverBanner}')` : 'none',
                  background: form.coverBanner
                    ? `url('${form.coverBanner}') no-repeat center/cover`
                    : 'linear-gradient(135deg, #001845 0%, #81C14B 100%)',
                }}
              />
          )}

          {/* Logo Section - Always below banner for clarity */}
          <div className={`px-6 py-4 flex items-start gap-4 ${editing ? 'border-b bg-gray-50' : ''}`}>
            <div className="relative">
              <div className="w-24 h-24 rounded-lg border-2 border-gray-200 bg-white shadow-sm overflow-hidden flex-shrink-0">
                {form.businessLogo ? (
                  <img
                    src={form.businessLogo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#81C14B]/10">
                    <Store className="w-10 h-10 text-[#81C14B]" />
                  </div>
                )}
              </div>
            </div>

            {/* Logo Upload Editor (when editing) */}
            {editing ? (
              <div className="flex-1 min-w-0">
                <ImageUploadField
                  label="Business Logo"
                  value={form.businessLogo}
                  onChange={(url) => setForm({ ...form, businessLogo: url || '' })}
                  endpoint="/api/uploads/profile-image"
                  formDataExtra={{ type: 'business_logo' }}
                  showPreview={false}
                  helpText="Square image recommended (500x500px), max 10MB"
                />
              </div>
            ) : null}
          </div>

          {/* Name + description (non-edit view) */}
          {!editing && (
            <CardContent className="pt-4 pb-5 px-6">
              <h2 className="font-bold text-lg leading-tight mb-2">
                {form.businessName || user?.fullName || 'Your Business'}
              </h2>
              <Badge className="bg-[#81C14B] text-white border-0 text-xs mb-3">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Seller
              </Badge>
              <p className="text-sm text-muted-foreground">
                {form.businessDescription || 'No description yet.'}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  disabled={!editing}
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Your business name"
                />
              </div>
              <div>
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!editing}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Lagos, Nigeria"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label>Business Description</Label>
                <Textarea
                  disabled={!editing}
                  rows={3}
                  value={form.businessDescription}
                  onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
                  placeholder="Tell customers about your business..."
                />
              </div>
              <div className="col-span-2">
                <Label>Product Categories (comma separated)</Label>
                <Input
                  disabled={!editing}
                  value={form.productCategories}
                  onChange={(e) => setForm({ ...form, productCategories: e.target.value })}
                  placeholder="e.g. Health, Education, Technology"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Social */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!editing}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!editing}
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://yoursite.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Instagram</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!editing}
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    placeholder="@yourhandle"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Twitter / X</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!editing}
                    value={form.twitter}
                    onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                    placeholder="@yourhandle"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Method Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Payout Method & Account Details</span>
              <Badge variant="outline" className="text-xs capitalize font-medium">
                {form.payoutMethod?.replace('_', ' ') || 'Bank Transfer'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Method Selection */}
            <div>
              <Label htmlFor="payout-method" className="text-base font-semibold mb-3 block">
                Select Payout Method
              </Label>
              <select
                id="payout-method"
                disabled={!editing}
                value={form.payoutMethod}
                onChange={(e) => setForm({ ...form, payoutMethod: e.target.value })}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                {PAYOUT_METHODS.map((method) => (
                  <option key={method.key} value={method.key}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Transfer Fields */}
            {(form.payoutMethod === 'bank' || form.payoutMethod === 'bank_transfer') && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Bank Account Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="bank-name">Bank Name *</Label>
                    <Input
                      id="bank-name"
                      disabled={!editing}
                      value={form.payoutBankName}
                      onChange={(e) => setForm({ ...form, payoutBankName: e.target.value })}
                      placeholder="e.g., Guaranty Trust Bank (GTB)"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-name">Account Holder Name *</Label>
                    <Input
                      id="account-name"
                      disabled={!editing}
                      value={form.payoutAccountName}
                      onChange={(e) => setForm({ ...form, payoutAccountName: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-number">Account Number *</Label>
                    <Input
                      id="account-number"
                      disabled={!editing}
                      value={form.payoutAccountNumber}
                      onChange={(e) => setForm({ ...form, payoutAccountNumber: e.target.value })}
                      placeholder="10-16 digit account number"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Money Fields */}
            {form.payoutMethod === 'mobile_money' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">Mobile Money Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobile-provider">Provider *</Label>
                    <select
                      id="mobile-provider"
                      disabled={!editing}
                      value={form.payoutMobileProvider}
                      onChange={(e) => setForm({ ...form, payoutMobileProvider: e.target.value })}
                      className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50"
                      required
                    >
                      <option value="">Select provider</option>
                      {MOBILE_MONEY_PROVIDERS.map((provider) => (
                        <option key={provider.key} value={provider.key}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="mobile-number">Phone Number *</Label>
                    <Input
                      id="mobile-number"
                      disabled={!editing}
                      value={form.payoutMobileNumber}
                      onChange={(e) => setForm({ ...form, payoutMobileNumber: e.target.value })}
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="account-name-mobile">Account Holder Name *</Label>
                    <Input
                      id="account-name-mobile"
                      disabled={!editing}
                      value={form.payoutAccountName}
                      onChange={(e) => setForm({ ...form, payoutAccountName: e.target.value })}
                      placeholder="Name registered with mobile money"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Fields */}
            {form.payoutMethod === 'paypal' && (
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-900">PayPal Account Details</p>
                <div>
                  <Label htmlFor="paypal-email">PayPal Email *</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    disabled={!editing}
                    value={form.payoutEmail}
                    onChange={(e) => setForm({ ...form, payoutEmail: e.target.value })}
                    placeholder="your.email@paypal.com"
                    required
                  />
                </div>
              </div>
            )}

            {/* Stripe Fields */}
            {form.payoutMethod === 'stripe' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-3">Stripe Account Details</p>
                <p className="text-xs text-purple-700 mb-4">
                  Enter your Stripe account information. Admin will use this to process your payouts manually.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stripe-account-id">Account ID *</Label>
                    <Input
                      id="stripe-account-id"
                      disabled={!editing}
                      value={form.payoutAccountId}
                      onChange={(e) => setForm({ ...form, payoutAccountId: e.target.value })}
                      placeholder="acct_1234567890"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stripe-email">Email Associated with Account *</Label>
                    <Input
                      id="stripe-email"
                      type="email"
                      disabled={!editing}
                      value={form.payoutEmail}
                      onChange={(e) => setForm({ ...form, payoutEmail: e.target.value })}
                      placeholder="stripe@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paystack Fields */}
            {form.payoutMethod === 'paystack' && (
              <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-medium text-indigo-900 mb-3">Paystack Bank Account Details</p>
                <p className="text-xs text-indigo-700 mb-4">
                  Enter your bank account where Paystack will send your payouts. Admin will use this information.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="paystack-bank">Bank Name *</Label>
                    <Input
                      id="paystack-bank"
                      disabled={!editing}
                      value={form.payoutBankName}
                      onChange={(e) => setForm({ ...form, payoutBankName: e.target.value })}
                      placeholder="e.g., Guaranty Trust Bank (GTB)"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paystack-account-name">Account Name *</Label>
                    <Input
                      id="paystack-account-name"
                      disabled={!editing}
                      value={form.payoutAccountName}
                      onChange={(e) => setForm({ ...form, payoutAccountName: e.target.value })}
                      placeholder="Account holder name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paystack-account-number">Account Number *</Label>
                    <Input
                      id="paystack-account-number"
                      disabled={!editing}
                      value={form.payoutAccountNumber}
                      onChange={(e) => setForm({ ...form, payoutAccountNumber: e.target.value })}
                      placeholder="10-16 digits"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Flutterwave Fields */}
            {form.payoutMethod === 'flutterwave' && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-900 mb-3">Flutterwave Bank Account Details</p>
                <p className="text-xs text-red-700 mb-4">
                  Enter your bank account where Flutterwave will send your payouts. Admin will use this information.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="flutterwave-bank">Bank Name *</Label>
                    <Input
                      id="flutterwave-bank"
                      disabled={!editing}
                      value={form.payoutBankName}
                      onChange={(e) => setForm({ ...form, payoutBankName: e.target.value })}
                      placeholder="e.g., First Bank Nigeria"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="flutterwave-account-name">Account Name *</Label>
                    <Input
                      id="flutterwave-account-name"
                      disabled={!editing}
                      value={form.payoutAccountName}
                      onChange={(e) => setForm({ ...form, payoutAccountName: e.target.value })}
                      placeholder="Account holder name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="flutterwave-account-number">Account Number *</Label>
                    <Input
                      id="flutterwave-account-number"
                      disabled={!editing}
                      value={form.payoutAccountNumber}
                      onChange={(e) => setForm({ ...form, payoutAccountNumber: e.target.value })}
                      placeholder="10-16 digits"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!editing && (
          <div className="flex justify-center">
            <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
