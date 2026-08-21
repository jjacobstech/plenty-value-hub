import React, { useRef, useState } from 'react'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/api/http-client'

interface ImageUploadFieldProps {
  /**
   * Label to display above the upload field
   */
  label: string

  /**
   * Current image URL to display
   */
  value?: string | null

  /**
   * Callback when image URL changes
   */
  onChange: (url: string | null) => void

  /**
   * API endpoint for upload
   * Options: '/api/uploads/product-image', '/api/uploads/profile-image', '/api/uploads/admin-image'
   */
  endpoint: string

  /**
   * Optional additional form data to send with upload
   */
  formDataExtra?: Record<string, string>

  /**
   * Whether to show the image preview below
   */
  showPreview?: boolean

  /**
   * Optional CSS class for styling
   */
  className?: string

  /**
   * Whether the field is disabled
   */
  disabled?: boolean

  /**
   * Whether this is a required field
   */
  required?: boolean

  /**
   * Optional help text
   */
  helpText?: string

  /**
   * Maximum file size in MB (default: 10MB)
   */
  maxSizeMB?: number

  /**
   * Allowed file types (default: ['jpg', 'jpeg', 'png', 'webp', 'gif'])
   */
  allowedTypes?: string[]
}

/**
 * Reusable Image Upload Component
 *
 * Features:
 * - File input with preview
 * - Drag-and-drop support
 * - Upload progress indication
 * - Error handling with toast notifications
 * - Support for multiple upload endpoints
 * - Configurable file types and sizes
 * - Fully responsive design (mobile, tablet, desktop)
 *
 * Usage:
 * ```tsx
 * const [imageUrl, setImageUrl] = useState('')
 *
 * <ImageUploadField
 *   label="Product Image"
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   endpoint="/api/uploads/product-image"
 *   required
 * />
 * ```
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  endpoint,
  formDataExtra = {},
  showPreview = true,
  className = '',
  disabled = false,
  required = false,
  helpText,
  maxSizeMB = 10,
  allowedTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'],
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    }

    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)
    try {
      const formData = new FormData()
      formData.append('image', file)

      // Add any extra form data
      Object.entries(formDataExtra).forEach(([key, val]) => {
        formData.append(key, val)
      })

      setUploadProgress(30)

      const { data } = await api.post<{
        url?: string
        key?: string
        success: boolean
        error?: string
      }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log(data)

      setUploadProgress(100)

      if (data.success && data.url) {
        onChange(data.url)
        setPreview(null)
        setError(null)
        toast.success('Image uploaded successfully!', {
          description: `File: ${file.name}`,
        })
      } else {
        const errorMsg = data.error || 'Image upload failed: Invalid response'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err: any) {
      let errorMsg = 'Image upload failed'

      if (err.response?.status === 401) {
        errorMsg = 'Authentication required. Please log in again.'
      } else if (err.response?.status === 403) {
        errorMsg = 'You do not have permission to upload images.'
      } else if (err.response?.status === 400) {
        errorMsg = err.response?.data?.error || 'Invalid file or request'
      } else if (err.response?.status === 413) {
        errorMsg = 'File is too large. Please upload a smaller file.'
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.'
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.message) {
        errorMsg = err.message
      }

      setError(errorMsg)
      toast.error(errorMsg, {
        description: `File: ${file.name}`,
      })

      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ImageUploadField] File selected:', e.target.files?.[0]?.name)
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const displayImage = preview || value
  const showClearButton = value && !uploading

  return (
    <div className={`space-y-2 sm:space-y-3 md:space-y-4 w-full ${className}`}>
      {/* Label - Responsive text size */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Label className="text-xs sm:text-sm md:text-base font-medium break-words">{label}</Label>
        {required && <span className="text-red-500 text-xs sm:text-sm flex-shrink-0">*</span>}
      </div>

      {/* Upload Area - Responsive padding and text */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-3 sm:p-4 md:p-6 transition-all cursor-pointer w-full ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => {
          console.log(
            '[ImageUploadField] Upload area clicked, disabled:',
            disabled,
            'uploading:',
            uploading,
            'ref:',
            fileInputRef.current
          )
          if (!disabled && !uploading && fileInputRef.current) {
            fileInputRef.current.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.map((t) => `.${t}`).join(',')}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="text-center flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500 animate-spin flex-shrink-0" />
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Uploading...</p>
              {uploadProgress > 0 && (
                <div className="w-full max-w-xs px-2 sm:px-4 md:px-0 mt-1 sm:mt-2">
                  <div className="h-1 sm:h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 flex-shrink-0" />
              <div className="max-w-full px-2 sm:px-4 md:px-0">
                <p className="text-xs sm:text-sm md:text-base font-medium text-gray-700 break-words">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs sm:text-xs md:text-sm text-gray-500 mt-1 break-words">
                  {allowedTypes.join(', ').toUpperCase()} · Max {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help Text - Responsive text size */}
      {helpText && (
        <p className="text-xs sm:text-xs md:text-sm text-gray-600 break-words">{helpText}</p>
      )}

      {/* Error Message - Responsive layout */}
      {error && (
        <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg w-full">
          <AlertCircle className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0.5 md:mt-1" />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm md:text-base font-medium text-red-900 break-words">
              Upload Failed
            </p>
            <p className="text-xs sm:text-xs md:text-sm text-red-700 mt-0.5 sm:mt-1 break-words">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700 transition flex-shrink-0 mt-0.5"
            title="Close"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}

      {/* Preview - Responsive size */}
      {showPreview && displayImage && (
        <div className="relative inline-block">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
            <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />

            {/* Loading overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Clear button - Responsive size and position */}
          {showClearButton && (
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setPreview(null)
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 sm:p-1 hover:bg-red-600 transition shadow-md hover:shadow-lg flex-shrink-0"
              title="Remove image"
            >
              <X className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
