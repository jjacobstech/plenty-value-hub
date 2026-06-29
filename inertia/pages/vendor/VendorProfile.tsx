import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, Globe, Mail, AtSign, Phone, MapPin, CheckCircle2, Edit2, Save, Upload, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/http-client';

type VendorProfileProps = {
  user: any
}

export default function VendorProfile(props: VendorProfileProps) {
  const { user } = props
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Revoke object URLs on unmount to free memory
  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
      if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
    }
  }, [logoPreview, bannerPreview])

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
        productCategories: form.productCategories || undefined,
      })
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch {
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'business_logo' | 'cover_banner') => {
    const objectUrl = URL.createObjectURL(file)
    if (type === 'business_logo') setLogoPreview(objectUrl)
    else setBannerPreview(objectUrl)

    setUploading(type === 'business_logo' ? 'logo' : 'banner')
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('type', type)
      const { data } = await api.post<{ url: string }>('/api/profile/upload-image', fd)

      if (type === 'business_logo') {
        setLogoPreview(null)
        setForm(f => ({ ...f, businessLogo: data.url }))
        toast.success('Business logo updated!')
      } else {
        setBannerPreview(null)
        setForm(f => ({ ...f, coverBanner: data.url }))
        toast.success('Cover banner updated!')
      }
    } catch (err: any) {
      if (type === 'business_logo') setLogoPreview(null)
      else setBannerPreview(null)
      toast.error(err.response?.data?.error ?? 'Image upload failed')
    } finally {
      setUploading(null)
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
          disabled={saving || uploading !== null}
          style={editing ? { backgroundColor: '#001845', color: '#fff' } : {}}
        >
          {saving
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            : editing
              ? <><Save className="w-4 h-4 mr-2" />Save Changes</>
              : <><Edit2 className="w-4 h-4 mr-2" />Edit Profile</>}
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #001845 0%, #81C14B 100%)' }}>
          {(bannerPreview || form.coverBanner) && (
            <img
              src={bannerPreview ?? form.coverBanner}
              alt="Cover"
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
          {editing && (
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploading === 'banner'}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity gap-1"
            >
              {uploading === 'banner'
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><ImagePlus className="w-5 h-5" /><span className="text-xs">Change Banner</span></>}
            </button>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'cover_banner') }}
          />
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                {(logoPreview || form.businessLogo) ? (
                  <img
                    src={logoPreview ?? form.businessLogo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#81C14B]/10">
                    <Store className="w-8 h-8 text-[#81C14B]" />
                  </div>
                )}
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === 'logo'}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity"
                  title="Change logo"
                >
                  {uploading === 'logo'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Upload className="w-4 h-4" />}
                </button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'business_logo') }}
              />
            </div>
            <div className="mb-1">
              <h2 className="text-white font-bold text-lg drop-shadow">{form.businessName || user?.fullName || 'Your Business'}</h2>
              <Badge className="bg-[#81C14B] text-white border-0 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Seller
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="pt-4 pb-5 px-6">
          <p className="text-sm text-muted-foreground">{form.businessDescription || 'No description yet.'}</p>
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
              <Input disabled={!editing} value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="Your business name" />
            </div>
            <div>
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Lagos, Nigeria" className="pl-9" />
              </div>
            </div>
            <div className="col-span-2">
              <Label>Business Description</Label>
              <Textarea disabled={!editing} rows={3} value={form.businessDescription} onChange={e => setForm({ ...form, businessDescription: e.target.value })} placeholder="Tell customers about your business..." />
            </div>
            <div className="col-span-2">
              <Label>Product Categories (comma separated)</Label>
              <Input disabled={!editing} value={form.productCategories} onChange={e => setForm({ ...form, productCategories: e.target.value })} placeholder="e.g. Health, Education, Technology" />
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
                <Input disabled={!editing} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yoursite.com" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Instagram</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@yourhandle" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Twitter / X</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} placeholder="@yourhandle" className="pl-9" />
              </div>
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
