import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Quill, createEditorOptions, useEditorUploads } from '~/lib/editor'

interface QuillEditorProps {
  modelValue: string
  toolbarId?: string
  className?: string
  onUpdateModelValue: (value: string) => void
  onReady?: (quill: Quill) => void
}

export interface QuillEditorHandle {
  getHTML: () => string
  getJson: () => ReturnType<Quill['getContents']> | undefined
  getQuill: () => Quill | null
}

const QuillEditor = forwardRef<QuillEditorHandle, QuillEditorProps>(
  ({ modelValue, toolbarId, onUpdateModelValue, className, onReady }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const quillRef = useRef<Quill | null>(null)

    const { uploadByFile, uploadVideoByFile } = useEditorUploads()

    useEffect(() => {
      if (!editorRef.current) return

      const toolbarSelector = `#${toolbarId ?? 'toolbar'}`
      const quill = new Quill(
        editorRef.current,
        createEditorOptions(toolbarSelector, uploadByFile, uploadVideoByFile)
      )
      quillRef.current = quill

      if (modelValue) {
        quill.clipboard.dangerouslyPasteHTML(modelValue)
      }

      const handleTextChange = () => {
        onUpdateModelValue(quill.root.innerHTML)
      }
      quill.on('text-change', handleTextChange)

      onReady?.(quill)

      return () => {
        quill.off('text-change', handleTextChange)
        quillRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useImperativeHandle(ref, () => ({
      getHTML: () => quillRef.current?.root.innerHTML ?? '',
      getJson: () => quillRef.current?.getContents(),
      getQuill: () => quillRef.current,
    }))

    return <div ref={editorRef} className={className} />
  }
)

QuillEditor.displayName = 'QuillEditor'

export default QuillEditor
