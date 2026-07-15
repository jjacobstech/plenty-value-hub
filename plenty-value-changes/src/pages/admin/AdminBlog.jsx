import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Eye, FileText, Globe, Clock, Search, Send } from 'lucide-react'
import { toast } from 'sonner'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import StatsCard from '@/components/shared/StatsCard'

const BLOG_CATEGORIES = [
  'Product Reviews',
  'Buying Guides',
  'Industry News',
  'Tips & Tricks',
  'Platform Updates',
  'Affiliate Strategies',
]
const STATUS_COLORS = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}
const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['blockquote'],
    ['clean'],
  ],
}
const QUILL_FORMATS = [
  'bold',
  'italic',
  'underline',
  'header',
  'list',
  'bullet',
  'link',
  'image',
  'blockquote',
]

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image_url: '',
  category: '',
  tags: [],
  author_name: '',
  status: 'draft',
  seo_title: '',
  seo_description: '',
}

export default function AdminBlog() {
  const qc = useQueryClient()
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [tagInput, setTagInput] = useState('')

  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
  })

  const save = useMutation({
    mutationFn: (data) => {
      const slug =
        data.slug ||
        data.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      const readTime = Math.max(
        1,
        Math.round((data.content || '').replace(/<[^>]+>/g, '').split(' ').length / 200)
      )
      const payload = { ...data, slug, read_time_minutes: readTime }
      if (payload.status === 'published' && !editing?.published_at)
        payload.published_at = new Date().toISOString()
      return editing
        ? base44.entities.BlogPost.update(editing.id, payload)
        : base44.entities.BlogPost.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      setView('list')
      setEditing(null)
      setForm(EMPTY)
      toast.success('Post saved')
    },
  })

  const deletPost = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Post deleted')
    },
  })

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      title: p.title,
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      featured_image_url: p.featured_image_url || '',
      category: p.category || '',
      tags: p.tags || [],
      author_name: p.author_name || '',
      status: p.status,
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
    })
    setView('edit')
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
    }
    setTagInput('')
  }

  const filtered = posts.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  )
  const published = posts.filter((p) => p.status === 'published')
  const drafts = posts.filter((p) => p.status === 'draft')
  const totalViews = posts.reduce((s, p) => s + (p.view_count || 0), 0)

  if (view === 'edit') {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setView('list')
              setEditing(null)
              setForm(EMPTY)
            }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← Back to posts
          </button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save.mutate({ ...form, status: 'draft' })}>
              Save Draft
            </Button>
            <Button
              onClick={() => save.mutate({ ...form, status: 'published' })}
              disabled={save.isPending}
              className="bg-primary text-white gap-2"
            >
              <Globe className="w-4 h-4" />{' '}
              {editing?.status === 'published' ? 'Update Post' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Post title..."
                  className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0"
                />
                <Input
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short excerpt / summary..."
                  className="text-sm border-0 border-b rounded-none px-0 focus-visible:ring-0"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="blog-editor-wrap">
                  <ReactQuill
                    theme="snow"
                    value={form.content}
                    onChange={(v) => setForm({ ...form, content: v })}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Write your blog post here..."
                    style={{ minHeight: 380 }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold" style={{ color: '#001845' }}>
                  Post Settings
                </p>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
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
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Featured Image URL</label>
                  <Input
                    value={form.featured_image_url}
                    onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold" style={{ color: '#001845' }}>
                  Tags
                </p>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-3 text-xs">
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
                        onClick={() => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })}
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
                <p className="text-sm font-semibold" style={{ color: '#001845' }}>
                  SEO
                </p>
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

        <style>{`
          .blog-editor-wrap .ql-container { border: none !important; font-size: 15px; min-height: 380px; }
          .blog-editor-wrap .ql-editor { min-height: 380px; padding: 12px 0; line-height: 1.75; color: #001845; }
          .blog-editor-wrap .ql-toolbar { border: none !important; border-bottom: 1px solid #f3f4f6 !important; padding: 8px 0; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
            Blog Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create, publish and manage blog content</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setForm(EMPTY)
            setView('edit')
          }}
          className="gap-2 bg-primary text-white"
        >
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Posts" value={posts.length} icon={FileText} />
        <StatsCard title="Published" value={published.length} icon={Globe} />
        <StatsCard title="Drafts" value={drafts.length} icon={Clock} />
        <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">All Posts</CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="pl-8 h-8 w-48 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No blog posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {p.featured_image_url && (
                    <img
                      src={p.featured_image_url}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
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
                      <span>{p.read_time_minutes || 5} min read</span>
                      <span>{p.view_count || 0} views</span>
                      {p.published_at && (
                        <span>{new Date(p.published_at).toLocaleDateString()}</span>
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
                      onClick={() => deletPost.mutate(p.id)}
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
  )
}
