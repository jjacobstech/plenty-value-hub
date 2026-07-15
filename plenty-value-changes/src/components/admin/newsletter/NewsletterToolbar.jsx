import React, { useRef } from 'react'
import { Image, Video } from 'lucide-react'

export default function NewsletterToolbar({ onImageInsert, onVideoInsert }) {
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const toolbarBtn = `
    ql-custom-btn flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 cursor-pointer
    hover:bg-[#1A2E50] hover:text-[#00C853]
  `

  return (
    <>
      <div
        id="newsletter-toolbar"
        className="flex flex-wrap items-center gap-1 px-4 py-3"
        style={{ borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}
      >
        {/* Font Family */}
        <select
          className="ql-font rounded-lg px-2 py-1 text-xs"
          style={{
            background: '#fff',
            color: '#001845',
            border: '1px solid #e5e7eb',
            outline: 'none',
          }}
        >
          <option value="">Font</option>
          <option value="serif">Serif</option>
          <option value="monospace">Mono</option>
        </select>

        {/* Font Size */}
        <select
          className="ql-size rounded-lg px-2 py-1 text-xs"
          style={{
            background: '#fff',
            color: '#001845',
            border: '1px solid #e5e7eb',
            outline: 'none',
          }}
        >
          <option value="small">Small</option>
          <option value="">Normal</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
        </select>

        <Divider />

        {/* Headings */}
        <select
          className="ql-header rounded-lg px-2 py-1 text-xs"
          style={{
            background: '#fff',
            color: '#001845',
            border: '1px solid #e5e7eb',
            outline: 'none',
          }}
        >
          <option value="">Normal</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>

        <Divider />

        {/* Bold / Italic / Underline / Strike */}
        <button className="ql-bold ql-tb-btn" title="Bold" />
        <button className="ql-italic ql-tb-btn" title="Italic" />
        <button className="ql-underline ql-tb-btn" title="Underline" />
        <button className="ql-strike ql-tb-btn" title="Strikethrough" />

        <Divider />

        {/* Text Color / Background */}
        <select className="ql-color" title="Text Color">
          <option value="#E8EDF5" />
          <option value="#00C853" />
          <option value="#5A7399" />
          <option value="#FF5252" />
          <option value="#FFD740" />
          <option value="#40C4FF" />
        </select>
        <select className="ql-background" title="Highlight">
          <option value="#1A2E50" />
          <option value="#00C85330" />
          <option value="#FFD74030" />
          <option value="transparent" />
        </select>

        <Divider />

        {/* Alignment */}
        <select
          className="ql-align rounded-lg px-2 py-1 text-xs"
          style={{
            background: '#0A1628',
            color: '#E8EDF5',
            border: '1px solid #1A2E50',
            outline: 'none',
          }}
        >
          <option value="" />
          <option value="center" />
          <option value="right" />
          <option value="justify" />
        </select>

        <Divider />

        {/* Lists */}
        <button className="ql-list ql-tb-btn" value="ordered" title="Numbered List" />
        <button className="ql-list ql-tb-btn" value="bullet" title="Bullet List" />

        <Divider />

        {/* Blockquote */}
        <button className="ql-blockquote ql-tb-btn" title="Blockquote" />

        <Divider />

        {/* Link */}
        <button className="ql-link ql-tb-btn" title="Insert Link" />

        {/* Image upload */}
        <button
          type="button"
          title="Insert Image"
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:bg-gray-100"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#81C14B')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
        >
          <Image className="w-4 h-4" />
        </button>

        {/* Video upload */}
        <button
          type="button"
          title="Insert Video"
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:bg-gray-100"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#81C14B')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
        >
          <Video className="w-4 h-4" />
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageInsert}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onVideoInsert}
        />
      </div>

      <style>{`
        #newsletter-toolbar .ql-tb-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
        }
        #newsletter-toolbar .ql-tb-btn:hover { background: #f3f4f6; }
        #newsletter-toolbar .ql-tb-btn:hover .ql-stroke { stroke: #81C14B !important; }
        #newsletter-toolbar .ql-tb-btn:hover .ql-fill { fill: #81C14B !important; }
        #newsletter-toolbar .ql-tb-btn.ql-active { background: rgba(129,193,75,0.1); }
        #newsletter-toolbar .ql-tb-btn.ql-active .ql-stroke { stroke: #81C14B !important; }
        #newsletter-toolbar .ql-tb-btn.ql-active .ql-fill { fill: #81C14B !important; }
        #newsletter-toolbar .ql-stroke { stroke: #9ca3af; transition: stroke 0.15s; }
        #newsletter-toolbar .ql-fill { fill: #9ca3af; transition: fill 0.15s; }
        #newsletter-toolbar .ql-picker { color: #9ca3af; }
        #newsletter-toolbar .ql-picker-label { color: #9ca3af; border: none; }
        #newsletter-toolbar .ql-picker-options { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        #newsletter-toolbar .ql-picker-item { color: #001845; }
        #newsletter-toolbar .ql-picker-item:hover { background: #f9fafb; color: #81C14B; }
        #newsletter-toolbar .ql-color-picker .ql-picker-label svg { display: none; }
        #newsletter-toolbar .ql-color-picker .ql-picker-label::after { content: 'A'; font-weight: 700; font-size: 13px; }
      `}</style>
    </>
  )
}

function Divider() {
  return <div className="w-px h-5 mx-1 rounded-full bg-gray-200" />
}
