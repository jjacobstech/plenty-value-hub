import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, ImageIcon, CheckCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

const DEFAULT_HERO = '/hero-banner.png'

type Setting = { id: number; key: string; label: string | null; value: string | null }

type Props = { settings: Setting[] }

export default function AdminHeroBanner({ settings = [] }: Props) {
  const heroSetting = settings.find((s) => s.key === 'hero_banner')
  const [activeImage, setActiveImage] = useState(heroSetting?.value || DEFAULT_HERO)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'hero_banner')
      const res = await axios.post('/api/uploads/admin-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreviewUrl(res.data.url)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handlePublish = async () => {
    if (!previewUrl) return
    setSaving(true)
    try {
      await axios.post('/api/admin/site-settings', {
        key: 'hero_banner',
        label: 'Hero Banner Image',
        value: previewUrl,
      })
      setActiveImage(previewUrl)
      setPreviewUrl(null)
      toast.success('Hero banner updated! The homepage hero image has been updated.')
    } catch {
      toast.error('Failed to save hero banner')
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefault = async () => {
    setSaving(true)
    try {
      await axios.post('/api/admin/site-settings', {
        key: 'hero_banner',
        label: 'Hero Banner Image',
        value: DEFAULT_HERO,
      })
      setActiveImage(DEFAULT_HERO)
      setPreviewUrl(null)
      toast.success('Hero banner reset to default')
    } catch {
      toast.error('Failed to reset hero banner')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
            Hero Banner Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage the homepage hero banner image.
          </p>
        </div>

        {/* Current Active Banner */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Active Hero Banner</CardTitle>
                <CardDescription>Currently displayed on the homepage</CardDescription>
              </div>
              <Badge className="border-0 text-white" style={{ backgroundColor: '#81C14B' }}>
                <CheckCircle className="w-3 h-3 mr-1" /> Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="relative w-full rounded-lg overflow-hidden border"
              style={{ aspectRatio: '820/312' }}
            >
              <img
                src={activeImage}
                alt="Active hero banner"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleResetDefault}
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reset to Default
            </Button>
          </CardContent>
        </Card>

        {/* Upload New Banner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload New Banner</CardTitle>
            <CardDescription>
              Recommended: widescreen image (820×312px or larger, 16:9 or similar). JPEG or PNG.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#81C14B] hover:bg-[#81C14B08] transition-colors">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                {uploading ? (
                  <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#81C14B' }} />
                ) : (
                  <Upload className="w-8 h-8" style={{ color: '#81C14B' }} />
                )}
                <p className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p className="text-xs">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>

            {previewUrl && (
              <div className="space-y-3">
                <p className="text-sm font-semibold" style={{ color: '#001845' }}>
                  Preview
                </p>
                <div
                  className="relative w-full rounded-lg overflow-hidden border-2 border-[#81C14B]"
                  style={{ aspectRatio: '820/312' }}
                >
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Badge
                      className="border-0 text-white text-xs"
                      style={{ backgroundColor: '#001845' }}
                    >
                      <ImageIcon className="w-3 h-3 mr-1" /> Preview
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePublish}
                    disabled={saving}
                    className="font-semibold text-white"
                    style={{ backgroundColor: '#81C14B' }}
                  >
                    {saving ? 'Publishing...' : 'Publish to Homepage'}
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewUrl(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
