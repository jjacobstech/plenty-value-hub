import React from 'react'
import { Upload, X, FileImage, FileVideo, File, Lightbulb, CheckCircle2 } from 'lucide-react'

const TIPS = [
  'Keep subject lines under 60 characters.',
  'Use a clear call-to-action in every email.',
  'Personalize the opening line when possible.',
  'Compress images before embedding them.',
  'Test on mobile before sending.',
  'One main idea per newsletter works best.',
]

const fileIcon = (type) => {
  if (type === 'Image' || type === 'Thumbnail')
    return <FileImage className="w-4 h-4" style={{ color: '#81C14B' }} />
  if (type === 'Video') return <FileVideo className="w-4 h-4" style={{ color: '#001845' }} />
  return <File className="w-4 h-4" style={{ color: '#6b7280' }} />
}

export default function NewsletterSidePanel({
  thumbnailPreview,
  onThumbnailUpload,
  onRemoveThumbnail,
  thumbnailInputRef,
  mediaFiles,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Thumbnail Upload */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #e5e7eb' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#001845' }}>
          Thumbnail
        </h3>

        {thumbnailPreview ? (
          <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
            <button
              onClick={onRemoveThumbnail}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-white/80 hover:bg-red-50 border border-gray-200 transition-all"
            >
              <X className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => thumbnailInputRef.current?.click()}
            className="w-full rounded-xl flex flex-col items-center justify-center gap-2 py-8 transition-all duration-150"
            style={{ border: '2px dashed #d1d5db', background: '#f9fafb' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#81C14B'
              e.currentTarget.style.background = 'rgba(129,193,75,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.background = '#f9fafb'
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(129,193,75,0.12)' }}
            >
              <Upload className="w-5 h-5" style={{ color: '#81C14B' }} />
            </div>
            <span className="text-xs text-gray-500">Click to upload thumbnail</span>
            <span className="text-xs text-gray-300">PNG, JPG, WEBP</span>
          </button>
        )}

        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onThumbnailUpload}
        />
      </div>

      {/* Media Files List */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #e5e7eb' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#001845' }}>
          Attached Media
        </h3>
        {mediaFiles.length === 0 ? (
          <p className="text-xs py-4 text-center text-gray-400">No media attached yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {mediaFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50"
                style={{ border: '1px solid #e5e7eb' }}
              >
                {fileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#001845' }}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {file.type} · {file.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Writing Tips */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4" style={{ color: '#81C14B' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#001845' }}>
            Writing Tips
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#81C14B' }} />
              <p className="text-xs leading-relaxed text-gray-500">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
