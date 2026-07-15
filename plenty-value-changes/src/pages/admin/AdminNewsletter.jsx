import React, { useState, useRef, useCallback } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { base44 } from '@/api/base44Client'
import { useToast } from '@/components/ui/use-toast'
import { LayoutTemplate, Upload, X } from 'lucide-react'
import NewsletterSidePanel from '@/components/admin/newsletter/NewsletterSidePanel'
import NewsletterToolbar from '@/components/admin/newsletter/NewsletterToolbar'
import NewsletterHeader from '@/components/admin/newsletter/NewsletterHeader'
import NewsletterActions from '@/components/admin/newsletter/NewsletterActions'
import NewsletterTemplates from '@/components/admin/newsletter/NewsletterTemplates'

const CATEGORIES = ['Product Insight', 'Review', 'Recommendation', 'Announcement', 'Update']

const QUILL_MODULES = {
  toolbar: {
    container: '#newsletter-toolbar',
  },
}

const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'link',
  'image',
  'video',
  'font',
  'size',
  'align',
  'color',
  'background',
]

export default function AdminNewsletter() {
  const { toast } = useToast()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [mediaFiles, setMediaFiles] = useState([])
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const quillRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const editorThumbnailInputRef = useRef(null)

  const handleThumbnailUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setThumbnailPreview(ev.target.result)
    reader.readAsDataURL(file)
    setThumbnail(file)
    setMediaFiles((prev) => [
      ...prev,
      { name: file.name, type: 'Thumbnail', size: (file.size / 1024).toFixed(1) + ' KB' },
    ])
    e.target.value = ''
  }, [])

  const handleRemoveThumbnail = useCallback(() => {
    setThumbnail(null)
    setThumbnailPreview(null)
    setMediaFiles((prev) => prev.filter((f) => f.type !== 'Thumbnail'))
  }, [])

  const handleImageInsert = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file || !quillRef.current) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const editor = quillRef.current.getEditor()
      const range = editor.getSelection(true)
      editor.insertEmbed(range.index, 'image', ev.target.result)
    }
    reader.readAsDataURL(file)
    setMediaFiles((prev) => [
      ...prev,
      { name: file.name, type: 'Image', size: (file.size / 1024).toFixed(1) + ' KB' },
    ])
    e.target.value = ''
  }, [])

  const handleVideoInsert = useCallback((e) => {
    const file = e.target.files[0]
    if (!file || !quillRef.current) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const editor = quillRef.current.getEditor()
      const range = editor.getSelection(true)
      editor.insertEmbed(range.index, 'video', ev.target.result)
    }
    reader.readAsDataURL(file)
    setMediaFiles((prev) => [
      ...prev,
      { name: file.name, type: 'Video', size: (file.size / (1024 * 1024)).toFixed(1) + ' MB' },
    ])
    e.target.value = ''
  }, [])

  const handleSend = async () => {
    if (!subject.trim()) {
      toast({
        title: 'Subject required',
        description: 'Please enter a subject line.',
        variant: 'destructive',
      })
      return
    }
    if (!content || content === '<p><br></p>') {
      toast({
        title: 'Content required',
        description: 'Please write some content.',
        variant: 'destructive',
      })
      return
    }
    setIsSending(true)
    const subscribers = await base44.entities.NewsletterSubscriber.filter(
      { status: 'active' },
      null,
      1000
    )
    await base44.entities.Newsletter.create({
      subject,
      category,
      content,
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipients_count: subscribers.length,
    })
    toast({
      title: 'Newsletter sent!',
      description: `"${subject}" has been sent to ${subscribers.length} subscribers.`,
    })
    setIsSending(false)
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await base44.entities.Newsletter.create({ subject, category, content, status: 'draft' })
    toast({ title: 'Draft saved', description: 'Your newsletter has been saved as a draft.' })
    setIsSaving(false)
  }

  const handleClear = () => {
    setSubject('')
    setCategory('')
    setContent('')
    setThumbnail(null)
    setThumbnailPreview(null)
    setMediaFiles([])
    setShowTemplates(false)
    toast({ title: 'Cleared', description: 'The editor has been reset.' })
  }

  const handleApplyTemplate = (tpl) => {
    setSubject(tpl.subject)
    setContent(tpl.content)
    setShowTemplates(false)
    toast({ title: 'Template applied', description: `"${tpl.label}" template loaded.` })
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Page heading + Templates toggle */}
        <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#001845' }}>
              Newsletter Composer
            </h1>
            <p className="text-sm mt-1 text-gray-500">
              Craft and send newsletters to your subscribers
            </p>
          </div>
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border"
            style={
              showTemplates
                ? { background: 'rgba(129,193,75,0.12)', color: '#81C14B', borderColor: '#81C14B' }
                : { background: '#fff', color: '#001845', borderColor: '#e5e7eb' }
            }
          >
            <LayoutTemplate className="w-4 h-4" />
            {showTemplates ? 'Hide Templates' : 'Use a Template'}
          </button>
        </div>

        {/* Templates panel */}
        {showTemplates && (
          <div className="mb-5">
            <NewsletterTemplates
              onApply={handleApplyTemplate}
              onClose={() => setShowTemplates(false)}
            />
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* Main editor area */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <NewsletterHeader
              subject={subject}
              setSubject={setSubject}
              category={category}
              setCategory={setCategory}
              categories={CATEGORIES}
            />

            {/* Editor card */}
            <div
              className="rounded-2xl overflow-hidden flex flex-col bg-white"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <NewsletterToolbar
                onImageInsert={handleImageInsert}
                onVideoInsert={handleVideoInsert}
              />

              {/* Thumbnail upload strip inside editor */}
              <div
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderBottom: '1px solid #f3f4f6' }}
              >
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Thumbnail
                </span>
                {thumbnailPreview ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={thumbnailPreview}
                      alt="thumb"
                      className="w-16 h-10 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      onClick={handleRemoveThumbnail}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => editorThumbnailInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                    style={{ borderColor: '#e5e7eb', color: '#6b7280', background: '#f9fafb' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#81C14B'
                      e.currentTarget.style.color = '#81C14B'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.color = '#6b7280'
                    }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Thumbnail
                  </button>
                )}
                <input
                  ref={editorThumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                />
              </div>

              <div className="newsletter-editor-wrap">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Start writing your newsletter…"
                  style={{ minHeight: 420 }}
                />
              </div>
            </div>

            <NewsletterActions
              onSend={handleSend}
              onSaveDraft={handleSaveDraft}
              onClear={handleClear}
              isSending={isSending}
              isSaving={isSaving}
            />
          </div>

          {/* Side panel */}
          <div className="hidden xl:block w-72 shrink-0">
            <NewsletterSidePanel
              thumbnailPreview={thumbnailPreview}
              onThumbnailUpload={handleThumbnailUpload}
              onRemoveThumbnail={handleRemoveThumbnail}
              thumbnailInputRef={thumbnailInputRef}
              mediaFiles={mediaFiles}
            />
          </div>
        </div>
      </div>

      <style>{`
        .newsletter-editor-wrap .ql-container {
          border: none !important;
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          color: #001845;
          background: transparent;
          min-height: 420px;
        }
        .newsletter-editor-wrap .ql-editor {
          min-height: 420px;
          padding: 20px 24px;
          color: #001845;
          background: transparent;
          line-height: 1.75;
        }
        .newsletter-editor-wrap .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .newsletter-editor-wrap .ql-editor h1 { color: #001845; font-size: 2rem; font-weight: 700; }
        .newsletter-editor-wrap .ql-editor h2 { color: #001845; font-size: 1.5rem; font-weight: 600; }
        .newsletter-editor-wrap .ql-editor h3 { color: #001845; font-size: 1.25rem; font-weight: 600; }
        .newsletter-editor-wrap .ql-editor blockquote {
          border-left: 3px solid #81C14B;
          padding-left: 16px;
          color: #6b7280;
          margin: 12px 0;
        }
        .newsletter-editor-wrap .ql-editor a { color: #81C14B; }
        .newsletter-editor-wrap .ql-editor strong { color: #001845; }
        .newsletter-editor-wrap .ql-snow .ql-stroke { stroke: #6b7280; }
        .newsletter-editor-wrap .ql-snow .ql-fill { fill: #6b7280; }
        .newsletter-editor-wrap .ql-snow .ql-picker { color: #6b7280; }
      `}</style>
    </div>
  )
}
