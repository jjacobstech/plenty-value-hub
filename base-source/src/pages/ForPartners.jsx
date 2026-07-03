import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag, TrendingUp, CheckCircle, ArrowRight, Star,
  BarChart3, Link2, Shield, Zap, DollarSign, Package, Users,
  Globe, Award, Target, BookOpen
} from 'lucide-react';

const VENDOR_BENEFITS = [
  { icon: Globe, title: 'Global Reach', desc: 'Access 11,000+ engaged subscribers and a growing affiliate network promoting your products.' },
  { icon: BarChart3, title: 'Powerful Dashboard', desc: 'Track orders, revenue, product performance and manage your store from one place.' },
  { icon: TrendingUp, title: 'Affiliate-Driven Sales', desc: 'Let affiliates promote your products and only pay commission on actual sales made.' },
  { icon: Shield, title: 'Trusted Platform', desc: 'Verified KYC process ensures marketplace quality and buyer confidence.' },
];

const VENDOR_STEPS = [
  { num: '01', title: 'Create Vendor Account', desc: 'Sign up and select Vendor as your account type.' },
  { num: '02', title: 'Complete KYC', desc: 'Verify your business with our simple onboarding process.' },
  { num: '03', title: 'List Products', desc: 'Upload your products, set pricing and commission rates.' },
  { num: '04', title: 'Receive Orders', desc: 'Affiliates promote your products and orders come in.' },
  { num: '05', title: 'Manage & Earn', desc: 'Track sales, manage inventory, and get paid.' },
];

const AFFILIATE_BENEFITS = [
  { icon: DollarSign, title: 'Up to 50% Commission', desc: 'Earn industry-leading commissions on every sale you generate.' },
  { icon: Link2, title: 'Unique Tracking Links', desc: 'Generate trackable affiliate links for any product in the marketplace.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor clicks, conversions, and earnings with detailed reporting.' },
  { icon: Package, title: 'Curated Products', desc: 'Choose from hundreds of quality-vetted products across all categories.' },
];

const AFFILIATE_STEPS = [
  { num: '01', title: 'Create Affiliate Account', desc: 'Sign up and select Affiliate as your account type.' },
  { num: '02', title: 'Browse Products', desc: 'Explore our curated marketplace and find products to promote.' },
  { num: '03', title: 'Generate Links', desc: 'Create unique tracking links for any product in one click.' },
  { num: '04', title: 'Promote Products', desc: 'Share links via social media, email, content, or any channel.' },
  { num: '05', title: 'Earn Commissions', desc: 'Get paid for every sale driven through your links.' },
];

function BenefitCard({ icon: Icon, title, desc, color }) {
  return (
    <Card className="border-border/50 hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: color + '15' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h4 className="font-semibold text-base mb-2" style={{ color: '#001845' }}>{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function StepItem({ num, title, desc, color }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5" style={{ backgroundColor: color }}>
        {num}
      </div>
      <div>
        <h4 className="font-semibold mb-1" style={{ color: '#001845' }}>{title}</h4>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export default function ForPartners() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#001845' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 border-0 text-sm" style={{ backgroundColor: 'rgba(129,193,75,0.2)', color: '#81C14B' }}>
            Partner with Plenty Value
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Grow Your Income on<br />
            <span style={{ color: '#81C14B' }}>Africa's #1 Affiliate Marketplace</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Whether you're a vendor with products to sell or an affiliate looking to earn commissions,
            Plenty Value gives you the tools, audience, and support to succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-base px-8 font-semibold" style={{ backgroundColor: '#81C14B', color: '#fff' }}>
                Become a Vendor <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-base px-8 border-white/40 text-white hover:bg-white/10 hover:text-white">
                Become an Affiliate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vendor Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#001845' }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <Badge className="border-0" style={{ backgroundColor: '#001845', color: '#fff' }}>For Vendors</Badge>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: '#001845' }}>
            Sell More. Reach Further.
          </h2>
          <p className="text-muted-foreground max-w-2xl mb-12 text-lg">
            List your products on Plenty Value and instantly tap into our network of motivated affiliates and 11,000+ engaged subscribers.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {VENDOR_BENEFITS.map((b, i) => (
              <BenefitCard key={i} {...b} color="#001845" />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-display text-2xl font-bold mb-8" style={{ color: '#001845' }}>How Vendors Earn</h3>
              <div className="space-y-6">
                {VENDOR_STEPS.map((s, i) => (
                  <StepItem key={i} {...s} color="#001845" />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#001845] to-[#002a6e] rounded-2xl p-8 text-white">
              <h3 className="font-bold text-xl mb-6">Vendor KYC Requirements</h3>
              <div className="space-y-3 mb-8">
                {[
                  'Business name & type',
                  'Country & State/Region',
                  'Business description',
                  'Social media or website',
                  'Contact information',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#81C14B' }} />
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mb-6">KYC helps us maintain marketplace quality and build buyer trust.</p>
              <Link to="/register">
                <Button className="w-full font-semibold" style={{ backgroundColor: '#81C14B', color: '#fff' }}>
                  Start Selling Today <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-border max-w-7xl mx-auto" />

      {/* Affiliate Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#81C14B' }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <Badge className="border-0" style={{ backgroundColor: '#81C14B', color: '#fff' }}>For Affiliates</Badge>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: '#001845' }}>
            Promote Products. Earn Commissions.
          </h2>
          <p className="text-muted-foreground max-w-2xl mb-12 text-lg">
            Join our affiliate network and earn up to 50% commission promoting products you believe in — no inventory needed.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {AFFILIATE_BENEFITS.map((b, i) => (
              <BenefitCard key={i} {...b} color="#81C14B" />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br rounded-2xl p-8 text-white order-2 md:order-1" style={{ background: 'linear-gradient(135deg, #81C14B, #5a9a2e)' }}>
              <h3 className="font-bold text-xl mb-6">Why Affiliates Choose Us</h3>
              <div className="space-y-3 mb-8">
                {[
                  'Up to 50% commission per sale',
                  'Real-time click & conversion tracking',
                  'Instant link generation dashboard',
                  'Hundreds of curated products',
                  'Reliable payout system',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-white" />
                    <span className="text-sm text-white/90">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/register">
                <Button className="w-full font-semibold bg-white hover:bg-white/90" style={{ color: '#81C14B' }}>
                  Start Earning Today <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="font-display text-2xl font-bold mb-8" style={{ color: '#001845' }}>How Affiliates Earn</h3>
              <div className="space-y-6">
                {AFFILIATE_STEPS.map((s, i) => (
                  <StepItem key={i} {...s} color="#81C14B" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4" style={{ color: '#001845' }}>
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of vendors and affiliates already growing on Plenty Value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-10 font-semibold text-white" style={{ backgroundColor: '#001845' }}>
                Create Vendor Account
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="px-10 font-semibold text-white" style={{ backgroundColor: '#81C14B' }}>
                Create Affiliate Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}