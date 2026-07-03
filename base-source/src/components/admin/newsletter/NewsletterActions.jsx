import React from 'react';
import { Send, Save, Trash2, Loader2 } from 'lucide-react';

export default function NewsletterActions({ onSend, onSaveDraft, onClear, isSending, isSaving }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 bg-white"
      style={{ border: '1px solid #e5e7eb' }}
    >
      {/* Left: Clear */}
      <button
        onClick={onClear}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
        style={{ background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
      >
        <Trash2 className="w-4 h-4" />
        Clear
      </button>

      {/* Right: Save Draft + Send */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-60"
          style={{ background: '#f9fafb', color: '#001845', border: '1px solid #e5e7eb' }}
          onMouseEnter={(e) => { if (!isSaving) { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#001845'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>

        <button
          onClick={onSend}
          disabled={isSending}
          className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 text-white"
          style={{ background: '#81C14B', boxShadow: '0 4px 16px rgba(129,193,75,0.3)' }}
          onMouseEnter={(e) => { if (!isSending) { e.currentTarget.style.background = '#6aaa35'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#81C14B'; e.currentTarget.style.transform = 'none'; }}
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isSending ? 'Sending…' : 'Send Newsletter'}
        </button>
      </div>
    </div>
  );
}