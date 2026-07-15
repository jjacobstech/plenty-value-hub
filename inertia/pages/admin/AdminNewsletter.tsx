import React, { useState, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  LayoutTemplate,
  Send,
  Save,
  Trash2,
  Upload,
  X,
  FileText,
  Bold,
  Italic,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { router } from '@inertiajs/react'

const CATEGORIES = ['Product Insight', 'Review', 'Recommendation', 'Announcement', 'Update']

const TEMPLATES = [
  {
    id: 1,
    label: 'Weekly Newsletter',
    subject: 'Plenty Value Weekly: Top high-converting products this week! 📈',
    category: 'Product Insight',
    content: `<h1>Weekly Plenty Value Insights</h1>
<p>Hello affiliates!</p>
<p>Here are the top performing products and niches this week that are converting at record levels:</p>
<ul>
  <li><strong>Product A:</strong> 15% conversion rate, avg payout $45</li>
  <li><strong>Product B:</strong> High gravity score, rising demand</li>
</ul>
<p>Start promoting today and scale your campaigns!</p>`,
  },
  {
    id: 2,
    label: 'Special Offer announcement',
    subject: 'Limited Time Deal: 20% discount on select categories! ⚡',
    category: 'Announcement',
    content: `<h1>Special Affiliates Announcement</h1>
<p>We are excited to share a limited-time offer for our vendor partners.</p>
<p>Check the dashboard for details on how to generate custom affiliate links for these items.</p>`,
  },
]

type Props = { subscriberCount: number }

export default function AdminNewsletter({ subscriberCount = 0 }: Props) {
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Product Insight')
  const [content, setContent] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await axios.post('/api/admin/site-settings/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setThumbnailPreview(res.data.url)
      toast.success('Thumbnail uploaded successfully')
    } catch {
      toast.error('Failed to upload thumbnail')
    }
  }

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null)
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after
    setContent(text.substring(0, start) + replacement + text.substring(end))
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!content.trim()) {
      toast.error('Content is required')
      return
    }
    setIsSending(true)
    try {
      await axios.post('/api/admin/newsletters', {
        subject,
        category,
        content,
        status: 'sent',
        recipients_count: subscriberCount,
      })
      toast.success(`Newsletter sent successfully to ${subscriberCount} subscribers!`)
      router.visit('/admin/newsletters')
    } catch {
      toast.error('Failed to send newsletter')
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!subject.trim()) {
      toast.error('Subject is required to save draft')
      return
    }
    setIsSaving(true)
    try {
      await axios.post('/api/admin/newsletters', {
        subject,
        category,
        content,
        status: 'draft',
      })
      toast.success('Draft saved successfully')
      router.visit('/admin/newsletters')
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setSubject('')
      setCategory('Product Insight')
      setContent('')
      setThumbnailPreview(null)
    }
  }

  const applyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setSubject(tpl.subject)
    setCategory(tpl.category)
    setContent(tpl.content)
    setShowTemplates(false)
    toast.success(`Template "${tpl.label}" loaded`)
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
              Newsletter Composer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Draft and distribute update mailers to {subscriberCount} subscribers
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-gray-200"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <LayoutTemplate className="w-4 h-4" />
            {showTemplates ? 'Hide Templates' : 'Templates'}
          </Button>
        </div>

        {/* Templates view */}
        {showTemplates && (
          <Card className="border-dashed border-[#81C14B] bg-[#81C14B05]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Choose a Template</CardTitle>
              <CardDescription>
                Select a layout to jump-start your composing process
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#81C14B] hover:shadow-sm cursor-pointer transition-all"
                >
                  <p className="font-semibold text-sm text-[#001845]">{tpl.label}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{tpl.subject}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid xl:grid-cols-4 gap-6 items-start">
          {/* Editor/Composer panel */}
          <div className="xl:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Subject Line
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject line..."
                    className="text-base font-medium"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                      <button
                        onClick={() => setActiveTab('write')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                          activeTab === 'write'
                            ? 'bg-white shadow-sm text-primary'
                            : 'text-gray-500'
                        }`}
                      >
                        Write
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                          activeTab === 'preview'
                            ? 'bg-white shadow-sm text-primary'
                            : 'text-gray-500'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                {activeTab === 'write' ? (
                  <div className="space-y-2">
                    {/* Rich text formatting tools */}
                    <div className="flex items-center gap-1.5 border-b pb-2 flex-wrap">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => insertText('<strong>', '</strong>')}
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => insertText('<em>', '</em>')}
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => insertText('<h1>', '</h1>')}
                        title="Header 1"
                      >
                        <Heading1 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => insertText('<h2>', '</h2>')}
                        title="Header 2"
                      >
                        <Heading2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => {
                          const url = window.prompt('Enter link URL:')
                          if (url) insertText(`<a href="${url}" target="_blank">`, '</a>')
                        }}
                        title="Link"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Craft your newsletter using standard HTML tags..."
                      rows={18}
                      className="font-mono text-sm leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-5 min-h-[380px] bg-white overflow-y-auto max-h-[500px]">
                    {content.trim() ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        Nothing to preview yet. Start typing content...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center flex-wrap gap-3">
              <Button
                variant="outline"
                className="text-red-500 hover:bg-red-50"
                onClick={handleClear}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isSending}
                  className="text-white font-semibold"
                  style={{ backgroundColor: '#81C14B' }}
                >
                  <Send className="w-4 h-4 mr-2" /> {isSending ? 'Sending...' : 'Send Newsletter'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thumbnail Banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {thumbnailPreview ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full object-cover aspect-video"
                    />
                    <button
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md hover:bg-red-50 text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary transition-all">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-xs font-medium text-gray-600">Upload Banner</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mailer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Target List</span>
                  <span className="font-semibold text-gray-700">All Active Subscribers</span>
                </div>
                <div className="flex justify-between">
                  <span>Subscribers</span>
                  <span className="font-semibold text-gray-700">{subscriberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="font-semibold text-gray-700">HTML Mailer</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
