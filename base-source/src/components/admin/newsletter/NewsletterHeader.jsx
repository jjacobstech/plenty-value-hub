import React from 'react';
import { Tag, AlignLeft } from 'lucide-react';

const inputStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  color: '#001845',
  borderRadius: '12px',
  padding: '12px 16px',
  width: '100%',
  fontSize: '15px',
  outline: 'none',
  fontFamily: 'Manrope, sans-serif',
  transition: 'border-color 0.2s',
};

export default function NewsletterHeader({ subject, setSubject, category, setCategory, categories }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Subject */}
      <div className="flex-1 relative">
        <AlignLeft
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#9ca3af' }}
        />
        <input
          type="text"
          placeholder="Subject line…"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '42px' }}
          onFocus={(e) => { e.target.style.borderColor = '#81C14B'; e.target.style.boxShadow = '0 0 0 3px rgba(129,193,75,0.12)'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Category */}
      <div className="relative sm:w-56">
        <Tag
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
          style={{ color: '#9ca3af' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '42px', cursor: 'pointer', appearance: 'none' }}
          onFocus={(e) => { e.target.style.borderColor = '#81C14B'; e.target.style.boxShadow = '0 0 0 3px rgba(129,193,75,0.12)'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
        >
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {/* Chevron */}
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#9ca3af' }}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}