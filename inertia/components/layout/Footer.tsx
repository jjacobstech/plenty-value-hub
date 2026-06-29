import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import BrandLogo from '@/components/shared/BrandLogo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/api/http-client';

const FOOTER_IMAGE = 'https://media.base44.com/images/public/6a235579fdf4cce1a3f803a3/e59786943_generated_image.png';

const FooterCol = ({ title, links }) => (
  <div>
    <h4 className="font-semibold text-xs uppercase tracking-widest mb-5" style={{ color: '#81C14B' }}>{title}</h4>
    <ul className="space-y-3">
      {links.map((l, i) => (
        <li key={i}>
          {l.href ? (
            <a href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {l.label}
            </a>
          ) : (
            <Link href={l.to} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {l.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  const [email, setEmail] = useState('');

  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!email || subscribing) return;
    setSubscribing(true);
    try {
      const res = await api.post('/newsletters', { email, source: 'footer' });
      if (res?.data?.already_subscribed) {
        toast.success("You're already subscribed! Check your inbox for our latest edition.");
      } else {
        toast.success("Subscribed! Check your inbox for a confirmation email.");
      }
      setEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer style={{ backgroundColor: '#001845' }} className="text-white">

      {/* Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '260px' }}>
        <img src={FOOTER_IMAGE} alt="Join Plenty Value" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,24,69,0.9) 0%, rgba(0,24,69,0.55) 55%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #001845 0%, transparent 40%)' }} />
        <div className="absolute inset-0 flex items-center px-8 md:px-16">
          <div className="max-w-lg">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
              Join Africa's Fastest Growing<br />
              <span style={{ color: '#81C14B' }}>Commerce Ecosystem</span>
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Vendors, affiliates, and buyers — all thriving together.
            </p>
            <div className="flex gap-3 mt-5">
              <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#81C14B' }}>
                Get Started
              </Link>
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.85)' }}>
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand — 2 cols */}
          <div className="sm:col-span-2">
            <div className="mb-5">
              <BrandLogo size={35} className="bg-white p-2 rounded-md" darkBg={true} linkTo="/" />
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Africa's leading affiliate marketplace and product review platform — connecting consumers, vendors, and affiliates.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/_plentyvalue_?igsh=M3A1ZHBidHNyemgw" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-[#81C14B] group text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                f
              </a>
              <a href="https://www.facebook.com/share/1GrEVUiJ4G/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-[#81C14B] text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                f
              </a>
              <a href="mailto:newsletter@plentyvalue.com"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-[#81C14B]"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                <Mail className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </a>
            </div>
          </div>

          {/* Company */}
          <FooterCol title="Company" links={[
            { to: '/', label: 'About Us' },
            { href: 'mailto:newsletter@plentyvalue.com', label: 'Contact Us' },
            { to: '/reviews', label: 'Newsletter' },
          ]} />

          {/* Marketplace */}
          <FooterCol title="Marketplace" links={[
            { to: '/marketplace', label: 'Browse Products' },
            { to: '/marketplace?sort=popular', label: 'Featured Products' },
            { to: '/marketplace', label: 'Categories' },
          ]} />

          {/* Partners */}
          <FooterCol title="Partners" links={[
            { to: '/for-partners', label: 'Become a Vendor' },
            { to: '/for-partners', label: 'Become an Affiliate' },
            { to: '/for-partners', label: 'Partner Resources' },
          ]} />

          {/* Support */}
          <FooterCol title="Support" links={[
            { href: 'mailto:newsletter@plentyvalue.com', label: 'Help Center' },
            { href: 'mailto:newsletter@plentyvalue.com', label: 'FAQs' },
            { to: '/privacy-policy', label: 'Privacy Policy' },
            { href: '#', label: 'Terms & Conditions' },
          ]} />
        </div>

        {/* Newsletter row */}
        <div className="border-t border-white/10 pt-10 pb-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#81C14B' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#81C14B' }}>11,000+ Active Subscribers</span>
              </div>
              <h4 className="font-semibold text-white mb-1">Get Expert Product Reviews</h4>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Buying guides, product comparisons, and exclusive deals — straight to your inbox.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                className="bg-white/8 border-white/20 text-white placeholder:text-slate-400 focus:border-[#81C14B] h-11 flex-1"
              />
              <Button onClick={handleSubscribe} disabled={subscribing} className="h-11 px-5 font-semibold shrink-0" style={{ backgroundColor: '#81C14B', color: '#fff' }}>
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            &copy; {new Date().getFullYear()} Plenty Value. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Africa's #1 Affiliate Marketplace</p>
        </div>
      </div>
    </footer>
  );
}