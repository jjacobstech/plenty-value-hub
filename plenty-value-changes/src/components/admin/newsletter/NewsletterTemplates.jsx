import React from 'react'
import { X, LayoutTemplate } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'announcement',
    label: 'Announcement',
    subject: '📢 Big News from Plenty Value!',
    content: `<h1>Big Announcement</h1><p>We have exciting news to share with our community…</p><p>Here are the key highlights:</p><ul><li>Point one</li><li>Point two</li><li>Point three</li></ul><p>Stay tuned for more updates. Thank you for being part of Plenty Value!</p>`,
  },
  {
    id: 'product_spotlight',
    label: 'Product Spotlight',
    subject: '🔥 Product of the Week',
    content: `<h2>Product Spotlight</h2><p>This week we're featuring a top-rated product just for you.</p><h3>Why we love it</h3><p>Describe the product benefits here…</p><p><strong>Commission Rate:</strong> XX%</p><p><a href="#">View Product →</a></p>`,
  },
  {
    id: 'weekly_digest',
    label: 'Weekly Digest',
    subject: '📰 Your Weekly Marketplace Digest',
    content: `<h1>Weekly Digest</h1><p>Here's what happened on Plenty Value this week:</p><h3>🏆 Top Products</h3><p>List top products here…</p><h3>📈 Trending Categories</h3><p>Mention trending categories…</p><h3>💡 Affiliate Tip of the Week</h3><p>Share a quick tip for affiliates…</p><p>See you next week!</p>`,
  },
  {
    id: 'promo',
    label: 'Promotion',
    subject: '🎉 Exclusive Offer Inside',
    content: `<h1>Special Offer Just for You!</h1><p>For a limited time, enjoy exclusive deals on our top products.</p><blockquote>Use code <strong>PLENTY10</strong> for 10% off your next purchase.</blockquote><p><a href="#">Shop Now →</a></p><p><em>Offer valid until [date]. Terms apply.</em></p>`,
  },
  {
    id: 'welcome',
    label: 'Welcome',
    subject: '👋 Welcome to Plenty Value!',
    content: `<h1>Welcome Aboard!</h1><p>We're thrilled to have you join the Plenty Value community.</p><p>Here's what you can do:</p><ul><li>Browse hundreds of top products</li><li>Earn commissions as an affiliate</li><li>List your products as a vendor</li></ul><p>Ready to get started? <a href="#">Explore the Marketplace →</a></p>`,
  },
]

export default function NewsletterTemplates({ onApply, onClose }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid #e5e7eb' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4" style={{ color: '#81C14B' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#001845' }}>
            Newsletter Templates
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
          style={{ color: '#6b7280' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Templates grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onApply(tpl)}
            className="group text-left rounded-xl p-4 border transition-all duration-150 hover:shadow-md"
            style={{ border: '1px solid #e5e7eb', background: '#f9fafb' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#81C14B'
              e.currentTarget.style.background = 'rgba(129,193,75,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.background = '#f9fafb'
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(129,193,75,0.12)' }}
            >
              <LayoutTemplate className="w-4 h-4" style={{ color: '#81C14B' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#001845' }}>
              {tpl.label}
            </p>
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#6b7280' }}>
              {tpl.subject}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
