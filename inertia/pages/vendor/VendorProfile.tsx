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
    payoutMethod: user?.payoutMethod || 'manual',
    payoutDetails: user?.payoutDetails || '',
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
      payoutMethod: user?.payoutMethod || 'bank_transfer',
      payoutDetails: user?.payoutDetails || '',
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
        payoutDetails: form.payoutDetails || undefined,
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
          <div
            className="h-36 relative bg-cover bg-center"
            style={{
              backgroundImage: form.coverBanner ? `url('${form.coverBanner}')` : 'none',
              background: form.coverBanner
                ? `url('${form.coverBanner}') no-repeat center/cover`
                : 'linear-gradient(135deg, #001845 0%, #81C14B 100%)',
            }}
          >
            {editing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-1/3">
                  <ImageUploadField
                    label=""
                    value={form.coverBanner}
                    onChange={(url) => setForm({ ...form, coverBanner: url || '' })}
                    endpoint="/api/uploads/profile-image"
                    formDataExtra={{ type: 'cover_banner' }}
                    showPreview={false}
                  />
                </div>
              </div>
            )}

            {/* Logo anchored to bottom-left of the banner */}
            <div className="absolute -bottom-10 left-6 flex items-end gap-4">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                  {form.businessLogo ? (
                    <img src={form.businessLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#81C14B]/10">
                      <Store className="w-8 h-8 text-[#81C14B]" />
                    </div>
                  )}
                </div>
                {editing && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer">
                    <ImageUploadField
                      label=""
                      value={form.businessLogo}
                      onChange={(url) => setForm({ ...form, businessLogo: url || '' })}
                      endpoint="/api/uploads/profile-image"
                      formDataExtra={{ type: 'business_logo' }}
                      showPreview={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name + badge row — padded top to clear the overlapping logo */}
          <div className="pt-14 px-6 pb-1 flex items-center gap-3">
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {form.businessName || user?.fullName || 'Your Business'}
              </h2>
              <Badge className="bg-[#81C14B] text-white border-0 text-xs mt-1">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Seller
              </Badge>
            </div>
          </div>

          <CardContent className="pt-2 pb-5 px-6">
            <p className="text-sm text-muted-foreground">
              {form.businessDescription || 'No description yet.'}
            </p>
          </CardContent>
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Payout Method</Label>
                <select
                  disabled={!editing}
                  value={form.payoutMethod}
                  onChange={(e) => setForm({ ...form, payoutMethod: e.target.value })}
                  className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {availableProviders.length > 0 ? (
                    availableProviders.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="manual">Manual / Direct Bank Transfer</option>
                      <option value="stripe">Stripe</option>
                      <option value="paystack">Paystack</option>
                      <option value="flutterwave">Flutterwave</option>
                      <option value="paypal">PayPal</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <Label>Account Details / Instructions</Label>
                <Textarea
                  disabled={!editing}
                  rows={3}
                  value={form.payoutDetails}
                  onChange={(e) => setForm({ ...form, payoutDetails: e.target.value })}
                  placeholder={
                    form.payoutMethod === 'paypal'
                      ? 'Enter your PayPal email address (e.g., vendor@paypal.com)'
                      : form.payoutMethod === 'mobile_money'
                        ? 'Enter your Mobile Money provider, phone number, and account name'
                        : form.payoutMethod === 'stripe'
                          ? 'Enter your Stripe Account ID (acct_xxx) or connected email'
                          : 'Enter Bank Name, Account Number, Account Holder Name, and SWIFT/Routing code'
                  }
                />
              </div>
            </div>
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
