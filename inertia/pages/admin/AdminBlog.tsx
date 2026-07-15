import React, { useState, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Globe,
  Clock,
  Search,
  ChevronLeft,
  Bold,
  Italic,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { router } from '@inertiajs/react'

const BLOG_CATEGORIES = [
  'Product Reviews',
  'Buying Guides',
  'Industry News',
  'Tips & Tricks',
  'Platform Updates',
  'Affiliate Strategies',
]

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image_url: '',
  category: '',
  tags: [] as string[],
  author_name: '',
  status: 'draft',
  seo_title: '',
  seo_description: '',
}

type BlogPost = {
  id: number
  title: string
  slug: string | null
  excerpt: string | null
  content: string | null
  featuredImageUrl: string | null
  category: string | null
  tags: string[] | null
  authorName: string | null
  status: 'draft' | 'published' | 'archived'
  seoTitle: string | null
  seoDescription: string | null
  readTimeMinutes: number
  viewCount: number
  publishedAt: string | null
  createdAt: string
}

type Props = { posts: BlogPost[] }

export default function AdminBlog({ posts: initialPosts = [] }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [saving, setSaving] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filtered = posts.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const published = posts.filter((p) => p.status === 'published')
  const drafts = posts.filter((p) => p.status === 'draft')
  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0)

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setView('edit')
  }

  const openEdit = (p: BlogPost) => {
    setEditing(p)
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      featured_image_url: p.featuredImageUrl || '',
      category: p.category || '',
      tags: p.tags || [],
      author_name: p.authorName || '',
      status: p.status,
      seo_title: p.seoTitle || '',
      seo_description: p.seoDescription || '',
    })
    setView('edit')
  }

  const handleSave = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) {
      toast.error('Post title is required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, status }
      if (editing) {
        const res = await axios.put(`/api/admin/blog-posts/${editing.id}`, payload)
        setPosts((prev) => prev.map((p) => (p.id === editing.id ? res.data : p)))
        toast.success('Post updated')
      } else {
        const res = await axios.post('/api/admin/blog-posts', payload)
        setPosts((prev) => [res.data, ...prev])
        toast.success('Post created')
      }
      setView('list')
      setEditing(null)
      setForm(EMPTY)
    } catch {
      toast.error('Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return
    try {
      await axios.delete(`/api/admin/blog-posts/${id}`)
      setPosts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
    }
    setTagInput('')
  }

  const removeTag = (t: string) => {
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) })
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after
    setForm({
      ...form,
      content: text.substring(0, start) + replacement + text.substring(end),
    })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  if (view === 'edit') {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-5 max-w-5xl mx-auto">
          {/* Top Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => {
                setView('list')
                setEditing(null)
                setForm(EMPTY)
              }}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Back to blog posts
            </button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="text-white font-semibold"
                style={{ backgroundColor: '#81C14B' }}
              >
                <Globe className="w-4 h-4 mr-2" />
                {editing?.status === 'published' ? 'Update Post' : 'Publish'}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-5 items-start">
            {/* Editor Area */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                      Post Title
                    </label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Post title..."
                      className="text-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                      Short Excerpt
                    </label>
                    <Input
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Short summary/hook..."
                    />
                  </div>

                  <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                      onClick={() => setActiveTab('write')}
                      className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === 'write' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
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

                  {activeTab === 'write' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 border-b pb-2 flex-wrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-600"
                          onClick={() => insertText('<strong>', '</strong>')}
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-600"
                          onClick={() => insertText('<em>', '</em>')}
                        >
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-600"
                          onClick={() => insertText('<h1>', '</h1>')}
                        >
                          <Heading1 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-600"
                          onClick={() => insertText('<h2>', '</h2>')}
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
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                      </div>

                      <Textarea
                        ref={textareaRef}
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        placeholder="Write your blog post body using HTML/Markdown..."
                        rows={16}
                        className="font-mono text-sm leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-5 min-h-[380px] bg-white overflow-y-auto max-h-[500px]">
                      {form.content.trim() ? (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: form.content }}
                        />
                      ) : (
                        <p className="text-gray-400 text-sm italic">Nothing to preview yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-[#001845]">Post Settings</p>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select category</option>
                      {BLOG_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Author</label>
                    <Input
                      value={form.author_name}
                      onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Featured Image URL</label>
                    <Input
                      value={form.featured_image_url}
                      onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-[#001845]">Tags</p>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addTag}
                      className="h-8 px-3 text-xs"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                      >
                        {t}
                        <button
                          onClick={() => removeTag(t)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-[#001845]">SEO</p>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SEO Title</label>
                    <Input
                      value={form.seo_title}
                      onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                      placeholder="SEO title..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Meta Description</label>
                    <textarea
                      value={form.seo_description}
                      onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                      placeholder="Meta description..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
              Blog Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Create, publish and curate blog articles</p>
          </div>
          <Button onClick={openNew} className="gap-2 bg-primary text-white font-semibold">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Posts" value={posts.length} icon={FileText} />
          <StatsCard title="Published" value={published.length} icon={Globe} />
          <StatsCard title="Drafts" value={drafts.length} icon={Clock} />
          <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
        </div>

        {/* List Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">All Articles</CardTitle>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-8 h-8 w-48 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No blog posts found. Create one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {p.featuredImageUrl && (
                      <img
                        src={p.featuredImageUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-medium text-sm truncate" style={{ color: '#001845' }}>
                          {p.title}
                        </h3>
                        <Badge className={STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}>
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{p.category || '—'}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {p.readTimeMinutes} min read
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          {p.viewCount} views
                        </span>
                        {p.publishedAt && (
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(p.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(p)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
