import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, ImageIcon, CheckCircle, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const HERO_KEY = 'hero_banner'
const DEFAULT_HERO =
  'https://media.base44.com/images/public/6a28952a913beeab7a9b7a70/3e3ab06cc_ab6877fd-0ad3-41a2-a9aa-11080b42b55e.png'

export default function AdminHeroBanner() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['site-settings', HERO_KEY],
    queryFn: () => base44.entities.SiteSettings.filter({ key: HERO_KEY }),
  })

  const heroSetting = settings[0]
  const activeImage = heroSetting?.value || DEFAULT_HERO

  const saveMutation = useMutation({
    mutationFn: async (imageUrl) => {
      if (heroSetting) {
        return base44.entities.SiteSettings.update(heroSetting.id, { value: imageUrl })
      } else {
        return base44.entities.SiteSettings.create({
          key: HERO_KEY,
          label: 'Hero Banner Image',
          value: imageUrl,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
      setPreviewUrl(null)
      toast({
        title: 'Hero banner updated!',
        description: 'The homepage hero image has been updated.',
      })
    },
  })

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file })
      setPreviewUrl(file_url)
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handlePublish = () => {
    if (previewUrl) saveMutation.mutate(previewUrl)
  }

  const handleResetDefault = () => {
    saveMutation.mutate(DEFAULT_HERO)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
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
          {isLoading ? (
            <div className="w-full h-48 bg-muted animate-pulse rounded-lg" />
          ) : (
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
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleResetDefault}
            disabled={saveMutation.isPending}
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

          {/* Preview */}
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
                  disabled={saveMutation.isPending}
                  className="font-semibold text-white"
                  style={{ backgroundColor: '#81C14B' }}
                >
                  {saveMutation.isPending ? 'Publishing...' : 'Publish to Homepage'}
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
  )
}
