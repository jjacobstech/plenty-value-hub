import { useForm } from '@inertiajs/react'
import Quill from 'quill'
import type { QuillOptions } from 'quill'
import QuillTableBetter from 'quill-table-better'
import 'quill/dist/quill.snow.css'
import 'quill-table-better/dist/quill-table-better.css'

const appUrl = import.meta.env.VITE_APP_URL

type UploadResult = { success: number; file: { url: string } }

export const useEditorUploads = () => {
  const uploadForm = useForm<{ image: File | null }>({ image: null })
  const uploadVideoForm = useForm<{ video: File | null }>({ video: null })
  // ─── Upload Helpers ───────────────────────────────────────────────────────────

  const uploadByFile = (file: File): Promise<UploadResult> => {
    return new Promise((resolve) => {
      uploadForm.clearErrors()
      uploadForm.setData('image', file)
      uploadForm.post('/admin/uploads/image', {
        preserveState: true,
        forceFormData: true,
        onSuccess: (page: any) =>
          resolve({ success: 1, file: { url: page.props.flashMessages.uploadUrl } }),
        onError: () => resolve({ success: 0, file: { url: '' } }),
        onFinish: () => uploadForm.setData('image', null),
      })
    })
  }

  const uploadVideoByFile = (file: File): Promise<UploadResult> => {
    return new Promise((resolve) => {
      uploadVideoForm.clearErrors()
      uploadVideoForm.setData('video', file)
      uploadVideoForm.post('/admin/uploads/video', {
        preserveState: true,
        forceFormData: true,
        onSuccess: (page: any) =>
          resolve({ success: 1, file: { url: page.props.flashMessages.uploadUrl } }),
        onError: () => resolve({ success: 0, file: { url: '' } }),
        onFinish: () => uploadVideoForm.setData('video', null),
      })
    })
  }

  return { uploadByFile, uploadVideoByFile }
}
// ─── Custom Blots ─────────────────────────────────────────────────────────────

const BlockEmbed = Quill.import('blots/block/embed') as any

class DividerBlot extends BlockEmbed {
  static blotName = 'divider'
  static tagName = 'hr'
  static create() {
    const node = super.create()
    node.setAttribute('class', 'my-2 border-gray-300')
    return node
  }
}

// ─── Image Resize + Delete Module ────────────────────────────────────────────

class ImageResizeModule {
  private quill: Quill
  private overlay: HTMLDivElement | null = null
  private target: HTMLImageElement | null = null
  private resizing = false
  private startX = 0
  private startWidth = 0
  private activeHandle: string = ''

  constructor(quill: Quill) {
    this.quill = quill
    this.quill.root.addEventListener('click', this.onImageClick)
    document.addEventListener('mousedown', this.onDocumentMouseDown)
  }

  // ── Click on image → show overlay ──────────────────────────────────────────

  private onImageClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG') {
      this.showOverlay(target as HTMLImageElement)
    } else if (!this.overlay?.contains(target)) {
      this.hideOverlay()
    }
  }

  private onDocumentMouseDown = (e: MouseEvent) => {
    if (this.overlay && !this.overlay.contains(e.target as Node) && e.target !== this.target) {
      this.hideOverlay()
    }
  }

  // ── Build overlay ───────────────────────────────────────────────────────────

  private showOverlay(img: HTMLImageElement) {
    this.hideOverlay()
    this.target = img

    // Highlight selected image
    img.style.outline = '2px solid #4f9cf9'

    this.overlay = document.createElement('div')
    Object.assign(this.overlay.style, {
      position: 'absolute',
      boxSizing: 'border-box',
      border: '2px dashed #4f9cf9',
      pointerEvents: 'none',
      zIndex: '100',
    })

    this.positionOverlay()

    // ── Resize handles (4 corners) ────────────────────────────────────────────
    const handles = ['nw', 'ne', 'sw', 'se']
    handles.forEach((pos) => {
      const handle = document.createElement('div')
      handle.dataset.handle = pos
      Object.assign(handle.style, {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: '#4f9cf9',
        borderRadius: '50%',
        pointerEvents: 'all',
        cursor: `${pos}-resize`,
        zIndex: '101',
        ...this.handlePosition(pos),
      })
      handle.addEventListener('mousedown', this.onResizeStart)
      this.overlay!.appendChild(handle)
    })

    // ── Delete button ─────────────────────────────────────────────────────────
    const deleteBtn = document.createElement('div')
    Object.assign(deleteBtn.style, {
      position: 'absolute',
      top: '-14px',
      right: '-14px',
      width: '24px',
      height: '24px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      cursor: 'pointer',
      pointerEvents: 'all',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '102',
      fontSize: '14px',
      lineHeight: '1',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    })
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
    deleteBtn.addEventListener('click', this.deleteImage)
    this.overlay.appendChild(deleteBtn)

    // ── Align buttons ─────────────────────────────────────────────────────────
    const alignBar = document.createElement('div')
    Object.assign(alignBar.style, {
      position: 'absolute',
      top: '-34px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '4px',
      pointerEvents: 'all',
      zIndex: '102',
    })

    const alignments: { label: string; value: string }[] = [
      { label: '⬅', value: 'left' },
      { label: '⬛', value: 'center' },
      { label: '➡', value: 'right' },
    ]

    alignments.forEach(({ label, value }) => {
      const btn = document.createElement('button')
      btn.textContent = label
      btn.title = `Align ${value}`
      Object.assign(btn.style, {
        background: '#1e293b',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '2px 6px',
        cursor: 'pointer',
        fontSize: '12px',
      })
      btn.addEventListener('click', () => this.alignImage(value))
      alignBar.appendChild(btn)
    })

    this.overlay.appendChild(alignBar)

    // Append overlay to editor container
    const container = this.quill.root.parentElement!
    container.style.position = 'relative'
    container.appendChild(this.overlay)

    window.addEventListener('resize', this.positionOverlay)
  }

  private handlePosition(pos: string): Partial<CSSStyleDeclaration> {
    const map: Record<string, Partial<CSSStyleDeclaration>> = {
      nw: { top: '-5px', left: '-5px' },
      ne: { top: '-5px', right: '-5px' },
      sw: { bottom: '-5px', left: '-5px' },
      se: { bottom: '-5px', right: '-5px' },
    }
    return map[pos] ?? {}
  }

  private positionOverlay = () => {
    if (!this.target || !this.overlay) return
    const imgRect = this.target.getBoundingClientRect()
    const containerRect = this.quill.root.parentElement!.getBoundingClientRect()
    Object.assign(this.overlay.style, {
      top: `${imgRect.top - containerRect.top + this.quill.root.parentElement!.scrollTop}px`,
      left: `${imgRect.left - containerRect.left}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
    })
  }

  private hideOverlay() {
    if (this.target) {
      this.target.style.outline = ''
    }
    this.overlay?.remove()
    this.overlay = null
    this.target = null
    window.removeEventListener('resize', this.positionOverlay)
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  private deleteImage = () => {
    if (!this.target) return
    this.target.remove()
    this.hideOverlay()
    this.quill.update()
  }

  // ── Align ───────────────────────────────────────────────────────────────────

  private alignImage(align: string) {
    if (!this.target) return
    if (align === 'left') {
      this.target.style.float = 'left'
      this.target.style.margin = '0 12px 8px 0'
      this.target.style.display = ''
    } else if (align === 'right') {
      this.target.style.float = 'right'
      this.target.style.margin = '0 0 8px 12px'
      this.target.style.display = ''
    } else {
      this.target.style.float = ''
      this.target.style.margin = '0 auto'
      this.target.style.display = 'block'
    }
    this.positionOverlay()
    this.quill.update()
  }

  // ── Resize ──────────────────────────────────────────────────────────────────

  private onResizeStart = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!this.target) return
    this.resizing = true
    this.startX = e.clientX
    this.startWidth = this.target.offsetWidth
    this.activeHandle = (e.target as HTMLElement).dataset.handle ?? 'se'
    document.addEventListener('mousemove', this.onResizeMove)
    document.addEventListener('mouseup', this.onResizeEnd)
  }

  private onResizeMove = (e: MouseEvent) => {
    if (!this.resizing || !this.target) return
    const dx = e.clientX - this.startX
    const isLeft = this.activeHandle.includes('w')
    const newWidth = Math.max(50, isLeft ? this.startWidth - dx : this.startWidth + dx)
    this.target.style.width = `${newWidth}px`
    this.target.style.height = 'auto'
    this.positionOverlay()
  }

  private onResizeEnd = () => {
    this.resizing = false
    document.removeEventListener('mousemove', this.onResizeMove)
    document.removeEventListener('mouseup', this.onResizeEnd)
    this.quill.update()
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────────

  destroy() {
    this.quill.root.removeEventListener('click', this.onImageClick)
    document.removeEventListener('mousedown', this.onDocumentMouseDown)
    this.hideOverlay()
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

Quill.register('formats/divider', DividerBlot, true)
Quill.register('modules/table', false, true)
Quill.register({ 'modules/table-better': QuillTableBetter }, true)
Quill.register('modules/imageResize', ImageResizeModule, true)

// ─── Options Factory ──────────────────────────────────────────────────────────

export const createEditorOptions = (
  toolbarSelector: string,
  uploadByFile: (file: File) => Promise<UploadResult>,
  uploadVideoByFile: (file: File) => Promise<UploadResult>
): QuillOptions => ({
  theme: 'snow',
  placeholder: 'Write something amazing...',
  modules: {
    'table': false,

    'imageResize': true,

    'table-better': {
      language: 'en_US',
      menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
      toolbarTable: true,
    },

    'keyboard': {
      bindings: QuillTableBetter.keyboardBindings,
    },

    'toolbar': {
      container: toolbarSelector,
      handlers: {
        image(this: { quill: Quill }) {
          const quill = this.quill
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.click()
          input.onchange = async () => {
            if (!input.files?.length) return
            try {
              const res = await uploadByFile(input.files[0])
              if (!res?.success) return
              const range = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 }
              quill.insertEmbed(range.index, 'image', `${appUrl}${res.file.url}`, 'user')
              quill.setSelection(range.index + 1)
            } catch (e) {
              console.error(e)
            }
          }
        },

        video(this: { quill: Quill }) {
          const quill = this.quill
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'video/*'
          input.click()
          input.onchange = async () => {
            if (!input.files?.length) return
            try {
              const res = await uploadVideoByFile(input.files[0])
              if (!res?.success) return
              const range = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 }
              quill.insertEmbed(range.index, 'video', `${appUrl}${res.file.url}`, 'user')
              quill.setSelection(range.index + 1)
            } catch (e) {
              console.error(e)
            }
          }
        },

        divider(this: { quill: Quill }) {
          const range = this.quill.getSelection(true)
          this.quill.insertEmbed(range.index, 'divider', true, 'user')
          this.quill.setSelection(range.index + 1)
        },
      },
    },
  },
})

export { Quill }
