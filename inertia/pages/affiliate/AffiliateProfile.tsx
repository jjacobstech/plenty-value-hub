import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  UserCircle,
  Globe,
  Mail,
  AtSign,
  Video,
  Phone,
  MapPin,
  CheckCircle2,
  Edit2,
  Save,
  Zap,
  Upload,
  Loader2,
  ImagePlus,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/api/http-client'

type AffiliateProfileProps = {
  user: any
}

export default function AffiliateProfile(props: AffiliateProfileProps) {
  const { user } = props
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'picture' | 'banner' | null>(null)
  const [picturePreview, setPicturePreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const pictureInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Revoke object URLs on unmount to free memory
  useEffect(() => {
    return () => {
      if (picturePreview?.startsWith('blob:')) URL.revokeObjectURL(picturePreview)
      if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
    }
  }, [picturePreview, bannerPreview])

  const [form, setForm] = useState({
    bio: user?.bio,
    phone: user?.phone,
    website: user?.website,
    instagram: user?.instagram,
    twitter: user?.twitter,
    youtube: user?.youtube,
    location: user?.location,
    marketingChannels: user?.marketingChannels,
    niche: user?.niche,
    profilePicture: user?.profilePicture,
    coverBanner: user?.coverBanner,
  })

  useEffect(() => {
    setForm({
      bio: user?.bio,
      phone: user?.phone,
      website: user?.website,
      instagram: user?.instagram,
      twitter: user?.twitter,
      youtube: user?.youtube,
      location: user?.location,
      marketingChannels: user?.marketingChannels,
      niche: user?.niche,
      profilePicture: user?.profilePicture,
      coverBanner: user?.coverBanner,
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/api/profile/affiliate', {
        bio: form.bio || undefined,
        phone: form.phone || undefined,
        website: form.website || undefined,
        instagram: form.instagram || undefined,
        twitter: form.twitter || undefined,
        youtube: form.youtube || undefined,
        location: form.location || undefined,
        niche: form.niche || undefined,
        marketingChannels: form.marketingChannels || undefined,
      })
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'profile_picture' | 'cover_banner') => {
    const objectUrl = URL.createObjectURL(file)
    if (type === 'profile_picture') setPicturePreview(objectUrl)
    else setBannerPreview(objectUrl)

    setUploading(type === 'profile_picture' ? 'picture' : 'banner')
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('type', type)
      const { data } = await api.post<{ url: string }>('/api/profile/upload-image', fd)
      if (type === 'profile_picture') {
        setPicturePreview(null)
        setForm((f) => ({ ...f, profilePicture: data.url }))
        toast.success('Profile picture updated!')
      } else {
        setBannerPreview(null)
        setForm((f) => ({ ...f, coverBanner: data.url }))
        toast.success('Cover banner updated!')
      }
    } catch (err: any) {
      if (type === 'profile_picture') setPicturePreview(null)
      else setBannerPreview(null)
      toast.error(err.response?.data?.error ?? 'Image upload failed')
    } finally {
      setUploading(null)
    }
  }

  return (
    <DashboardLayout role="affiliate">
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-[#715AFF]" />
              Affiliate Profile
            </h1>
            <p className="text-muted-foreground text-sm">Your affiliate identity on Plenty Value</p>
          </div>
          <Button
            variant={editing ? 'default' : 'outline'}
            onClick={editing ? handleSave : () => setEditing(true)}
            disabled={saving || uploading !== null}
            style={editing ? { backgroundColor: '#715AFF', color: '#fff' } : {}}
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
            className="h-36 relative"
            style={{ background: 'linear-gradient(135deg, #715AFF 0%, #001845 100%)' }}
          >
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
                {uploading === 'banner' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-xs">Change Banner</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleImageUpload(f, 'cover_banner')
              }}
            />
          </div>
          <CardContent className="pt-0 pb-5 px-6 relative">
            <div className="-mt-8 mb-4 flex items-end gap-4">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  {picturePreview || form.profilePicture ? (
                    <img
                      src={picturePreview ?? form.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#715AFF]/10">
                      <UserCircle className="w-10 h-10 text-[#715AFF]" />
                    </div>
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => pictureInputRef.current?.click()}
                    disabled={uploading === 'picture'}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity"
                    title="Change photo"
                  >
                    {uploading === 'picture' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </button>
                )}
                <input
                  ref={pictureInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleImageUpload(f, 'profile_picture')
                  }}
                />
              </div>
              <div className="">
                <h2 className="font-bold text-lg text-black">{user?.fullName || 'Affiliate'}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-[#715AFF] text-white border-0 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Affiliate
                  </Badge>
                  {form.niche && (
                    <Badge variant="outline" className="text-xs">
                      {form.niche}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{form.bio || 'No bio yet.'}</p>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div>
                <Label>Niche / Focus Area</Label>
                <Input
                  disabled={!editing}
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="e.g. Health & Wellness"
                />
              </div>
              <div className="col-span-2">
                <Label>Bio</Label>
                <Textarea
                  disabled={!editing}
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell sellers what makes you a great affiliate..."
                />
              </div>
              <div className="col-span-2">
                <Label>Marketing Channels</Label>
                <Input
                  disabled={!editing}
                  value={form.marketingChannels}
                  onChange={(e) => setForm({ ...form, marketingChannels: e.target.value })}
                  placeholder="e.g. WhatsApp, Email, Blog, YouTube"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social & Contact */}
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
                <Label>Website / Blog</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!editing}
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://..."
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
              <div>
                <Label>YouTube</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!editing}
                    value={form.youtube}
                    onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                    placeholder="youtube.com/..."
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Score */}
        <Card className="border-[#715AFF]/30 bg-[#715AFF]/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[#715AFF]" />
              <div>
                <p className="font-semibold text-sm">Affiliate Performance Score</p>
                <p className="text-xs text-muted-foreground">
                  Complete your profile to increase your visibility to sellers
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-[#715AFF]">
                  {[
                    form.bio,
                    form.instagram,
                    form.marketingChannels,
                    form.niche,
                    form.profilePicture,
                  ].filter(Boolean).length * 20}
                  %
                </p>
                <p className="text-xs text-muted-foreground">Profile complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
