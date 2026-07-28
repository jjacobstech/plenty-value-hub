import { useState, useRef } from 'react'
import { Table } from 'lucide-react' // adjust import to match your icon library
import QuillEditor, { type QuillEditorHandle } from './Editor'

interface PageEditorProps {
  content: string
  setContent: (value: string) => void
}

function PageEditor({ content, setContent }: PageEditorProps) {
  const [errors, setErrors] = useState<{ content?: string }>({})
  const editorRef = useRef<QuillEditorHandle>(null)

  return (
    <>
      <div
        id="toolbar"
        className="sticky top-0 z-40 flex flex-wrap items-center gap-1 p-3 bg-white border-b border-gray-200 shadow-sm"
      >
        {/* Group 1: Font */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-400">
          <select className="ql-font ql-btn"></select>

          <select className="ql-size ql-btn">
            <option value="small"></option>
            <option defaultValue=""></option>
            <option value="large"></option>
            <option value="huge"></option>
          </select>

          <select className="ql-header ql-btn">
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
            <option value="4"></option>
            <option value="5"></option>
            <option value="6"></option>
            <option defaultValue=""></option>
          </select>
        </div>

        {/* Group 2: Text */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-400">
          <button className="ql-bold ql-btn">B</button>
          <button className="ql-italic ql-btn"></button>
          <button className="ql-underline ql-btn"></button>
          <button className="ql-strike ql-btn"></button>
          <button className="ql-divider">―</button>
        </div>

        {/* Group 3: Color */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-400">
          <select className="ql-color ql-btn"></select>
          <select className="ql-background ql-btn"></select>
        </div>

        {/* Group 4: Script + Block */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-400">
          <button className="ql-script ql-btn" value="sub"></button>
          <button className="ql-script ql-btn" value="super"></button>
          <button className="ql-blockquote ql-btn"></button>
          <button className="ql-code-block ql-btn"></button>
        </div>

        {/* Group 5: Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-400">
          <button className="ql-list ql-btn" value="ordered"></button>
          <button className="ql-list ql-btn" value="bullet"></button>
          <button className="ql-list ql-btn" value="check"></button>
        </div>

        {/* Group 6: Layout */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-400">
          <button className="ql-indent ql-btn" value="-1"></button>
          <button className="ql-indent ql-btn" value="+1"></button>
          <button className="ql-direction ql-btn" value="rtl"></button>
          <select className="ql-align ql-btn"></select>
        </div>

        {/* Table (quill-table-better injects its own dropdown here via toolbarTable: true) */}
        <span className="ql-formats">
          <button className="ql-table-better" title="Insert Table">
            <Table />
          </button>
        </span>

        {/* Group 7: Media */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-400">
          <button className="ql-link ql-btn"></button>
          <button className="ql-image ql-btn"></button>
          {/* <button className="ql-video ql-btn"></button> */}
          <button className="ql-formula ql-btn"></button>
        </div>

        {/* Group 8: Clean */}
        <div className="flex items-center gap-1">
          <button className="ql-clean ql-btn"></button>
        </div>
      </div>

      <div>
        <QuillEditor
          ref={editorRef}
          modelValue={content}
          className="rounded-md bg-gray-100 min-h-screen w-full"
          onUpdateModelValue={(value) => {
            setContent(value)
            setErrors((prev) => ({ ...prev, content: '' }))
          }}
        />
      </div>
      <button
        className="text-gray-500 hover:text-gray-700 flex items-center gap-1.5 font-medium"
        type="button"
        onClick={() => {
          // access imperative methods directly
          const html = editorRef.current?.getHTML()
          console.log(html)
        }}
      >
        Log HTML
      </button>
      <button
        className="text-gray-500 hover:text-gray-700 flex items-center gap-1.5 font-medium"
        type="button"
        onClick={() => {
          // access imperative methods directly
          const html = editorRef.current?.getJson()
          console.log(html)
        }}
      >
        Log JSON
      </button>
    </>
  )
}

export default PageEditor
