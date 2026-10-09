import React, { useState } from 'react'
import SEO from '@/components/SEO'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/api/http-client'
import PublicLayout from '@/components/layout/PublicLayout'
import {
  ArrowRight,
  TrendingUp,
  Users,
  ChevronRight,
  Globe,
  BookOpen,
  CheckCircle,
  Zap,
  BarChart3,
  DollarSign,
  Link2,
  Target,
  Briefcase,
  PieChart,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const VENDOR_BENEFITS = [
  {
    icon: Users,
    title: 'Access a Network of Promoters',
    desc: 'Connect with affiliates and creators ready to promote your brand.',
  },
  {
    icon: TrendingUp,
    title: 'Pay for Results Only',
    desc: 'Set your commission and only pay when customers convert.',
  },
  {
    icon: BarChart3,
    title: 'Track Every Sale',
    desc: 'Get detailed performance reports on all affiliate activity.',
  },
  {
    icon: Zap,
    title: 'Launch Fast',
    desc: 'Create campaigns in minutes and start getting promoted.',
  },
]

const AFFILIATE_BENEFITS = [
  {
    icon: DollarSign,
    title: 'Earn Real Commissions',
    desc: 'Get paid up to 50% commission on every sale you drive.',
  },
  {
    icon: Target,
    title: 'Promote What You Love',
    desc: 'Choose from hundreds of brands and campaigns to promote.',
  },
  {
    icon: Link2,
    title: 'Unique Tracking Links',
    desc: 'Generate one-click affiliate links with built-in tracking.',
  },
  {
    icon: PieChart,
    title: 'Real-Time Earnings',
    desc: 'Watch your commissions grow and get paid automatically.',
  },
]

const FLOW_STEPS = [
  {
    num: 1,
    title: 'Brands Create Campaigns',
    desc: 'Vendors set commission rates and launch campaigns to reach new audiences.',
  },
  {
    num: 2,
    title: 'Affiliates Discover & Promote',
    desc: 'Creators find campaigns they like and share unique affiliate links.',
  },
  {
    num: 3,
    title: 'Customers Convert',
    desc: 'Customers click links and make purchases on the brand\'s website.',
  },
  {
    num: 4,
    title: 'We Track & Attribute',
    desc: 'Plenty Value records every click and ties conversions to the right affiliate.',
  },
  {
    num: 5,
    title: 'Commissions Are Calculated',
    desc: 'The system automatically calculates the commission earned.',
  },
  {
    num: 6,
    title: 'Affiliates Get Paid',
    desc: 'Approved commissions are paid directly to affiliate accounts.',
  },
]

const STATS = [
  { label: 'Active Affiliates', value: '11,000+', icon: Users },
  { label: 'Brands', value: '1,000+', icon: Briefcase },
  { label: 'Commissions Paid', value: '$3K+', icon: DollarSign },
  { label: 'Countries', value: '2+', icon: Globe },
]

type HomeProps = {
  featuredProducts?: any[]
  trendingProducts?: any[]
  categoryProducts?: Record<string, any[]>
  heroBannerImage?: string
}

export default function Home({
  featuredProducts = [],
  trendingProducts = [],
  categoryProducts = {},
  heroBannerImage = '/hero-banner.png',
}: HomeProps) {
  const [email, setEmail] = useState('')

  const handleSubscribe = async () => {
    if (!email) return
    try {
      await apiClient.post('/api/newsletters/subscribe', { email, source: 'homepage' })
      toast.success("Welcome! You're now subscribed.")
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    }
  }

  return (
    <div>
      <SEO
        title="Performance Marketing Platform for Brands & Affiliates"
        description="Plenty Value connects brands with affiliates and creators. Brands set commissions and reach new audiences. Affiliates earn from the results they drive."
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'Plenty Value',
          'description':
            'A performance marketing platform connecting brands with affiliates and creators who earn from the results they drive.',
          'url': typeof window !== 'undefined' ? window.location.origin : '',
        }}
      />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden min-h-[88vh] flex items-center"
        style={{ backgroundColor: '#001845' }}
      >
        <div className="absolute inset-0">
          <img
            src={heroBannerImage}
            alt="Plenty Value hero banner"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'blur(2px)', transform: 'scale(1.04)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001845]/90 via-[#001845]/65 to-[#001845]/25" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative w-full">
          <div className="max-w-2xl space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                className="mb-2 px-4 py-1.5 text-sm font-semibold border-0 shadow-lg"
                style={{ backgroundColor: '#81C14B', color: '#fff' }}
              >
                Performance Marketing Network
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight"
            >
              Promote Brands.
              <span className="block" style={{ color: '#81C14B' }}>
                Earn From Results.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-200 max-w-xl leading-relaxed"
            >
              Plenty Value connects brands with affiliates and creators. Brands pay commissions for real results. Affiliates and creators earn from what they promote.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Link href="/auth/signup?account=vendor">
                <Button
                  size="lg"
                  className="text-base px-8 w-full sm:w-auto font-semibold shadow-lg"
                  style={{ backgroundColor: '#81C14B', color: '#fff' }}
                >
                  Create Campaign <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/signup?account=affiliate">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 w-full sm:w-auto border-white/60 text-white hover:bg-white/10 hover:text-white"
                >
                  Find Opportunities
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(129,193,75,0.25)' }}
                  >
                    <stat.icon className="w-4 h-4" style={{ color: '#81C14B' }} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{stat.value}</p>
                    <p className="text-slate-300 text-xs">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── For Brands Section ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                className="mb-4 border-0"
                style={{ backgroundColor: '#81C14B20', color: '#81C14B' }}
              >
                For Brands & Vendors
              </Badge>
              <h2
                className="font-display text-3xl md:text-4xl font-bold mb-6"
                style={{ color: '#001845' }}
              >
                Reach New Customers Through Your Network
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Put your brand in front of more people through affiliates and creators who earn when they deliver results.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Create campaigns, set your commission rate, and let our network of promoters get to work. You only pay when customers actually convert.
              </p>
              <div className="space-y-4 mb-8">
                {VENDOR_BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ backgroundColor: 'rgba(129,193,75,0.2)' }}
                    >
                      <benefit.icon className="w-4 h-4" style={{ color: '#81C14B' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup?account=vendor">
                <Button className="font-semibold px-8 text-white" style={{ backgroundColor: '#001845' }}>
                  Create Your First Campaign <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=85&fit=crop"
                alt="Brand dashboard"
                className="rounded-2xl shadow-2xl w-full object-cover h-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── For Affiliates Section ── */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1 hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=85&fit=crop"
                alt="Affiliate earnings"
                className="rounded-2xl shadow-2xl w-full object-cover h-[420px]"
              />
            </div>
            <div className="order-1 md:order-2">
              <Badge
                className="mb-4 border-0"
                style={{ backgroundColor: '#81C14B20', color: '#81C14B' }}
              >
                For Affiliates & Creators
              </Badge>
              <h2
                className="font-display text-3xl md:text-4xl font-bold mb-6"
                style={{ color: '#001845' }}
              >
                Turn Your Audience Into Income
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Promote brands you believe in and earn real commissions. Get paid for every customer you refer who actually converts.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Browse hundreds of campaigns across your favorite categories. Generate unique tracking links. Watch your earnings grow in real-time.
              </p>
              <div className="space-y-4 mb-8">
                {AFFILIATE_BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ backgroundColor: 'rgba(129,193,75,0.2)' }}
                    >
                      <benefit.icon className="w-4 h-4" style={{ color: '#81C14B' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup?account=affiliate">
                <Button className="font-semibold px-8 text-white" style={{ backgroundColor: '#81C14B' }}>
                  Start Earning Today <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              className="mb-3 px-4 py-1.5 text-sm border-0"
              style={{ backgroundColor: '#001845', color: '#fff' }}
            >
              How It Works
            </Badge>
            <h2
              className="font-display text-3xl md:text-4xl font-bold mb-3"
              style={{ color: '#001845' }}
            >
              The Performance Marketing Loop
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Plenty Value is the infrastructure that connects brands with promoters, tracks every click and conversion, and ensures everyone gets paid fairly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FLOW_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow hover:shadow-lg transition-all duration-200 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: '#001845' }}
                      >
                        <span className="text-white font-bold text-lg">{step.num}</span>
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <ArrowRight className="w-4 h-4 hidden lg:block" style={{ color: '#81C14B' }} />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 text-lg" style={{ color: '#001845' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-2xl border-2" style={{ borderColor: '#81C14B', backgroundColor: '#81C14B10' }}>
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#81C14B' }} />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: '#001845' }}>
                  Accurate Tracking. Fair Attribution. Real Results.
                </h3>
                <p className="text-muted-foreground">
                  Every click is tracked with a unique ID. Every conversion is attributed to the correct affiliate. Every commission is calculated automatically. Disputes are handled fairly. Payments are on time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="font-display text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#001845' }}
          >
            Stay Updated on Opportunities
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Get notified about new high-commission campaigns, platform updates, and success stories from our top affiliates and brands.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              style={{ backgroundColor: '#f8fafc' }}
            />
            <Button
              onClick={handleSubscribe}
              className="shrink-0 h-12 px-6 font-semibold"
              style={{ backgroundColor: '#81C14B', color: '#fff' }}
            >
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#001845' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border-2 border-white/20 flex flex-col justify-between"
            >
              <div>
                <Briefcase className="w-8 h-8 mb-4" style={{ color: '#81C14B' }} />
                <h3 className="text-2xl font-bold text-white mb-3">Are You a Brand?</h3>
                <p className="text-slate-200 mb-6">
                  Launch affiliate campaigns and reach our network of active promoters. Set your commission and grow your customer base.
                </p>
              </div>
              <Link href="/auth/signup?account=vendor">
                <Button
                  size="lg"
                  className="w-full font-semibold text-white"
                  style={{ backgroundColor: '#81C14B' }}
                >
                  Get Started as Brand <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border-2 border-white/20 flex flex-col justify-between"
            >
              <div>
                <Users className="w-8 h-8 mb-4" style={{ color: '#81C14B' }} />
                <h3 className="text-2xl font-bold text-white mb-3">Are You an Affiliate?</h3>
                <p className="text-slate-200 mb-6">
                  Find campaigns you love and start promoting. Generate unique links, track your earnings, and get paid for real results.
                </p>
              </div>
              <Link href="/auth/signup?account=affiliate">
                <Button
                  size="lg"
                  className="w-full font-semibold text-white"
                  style={{ backgroundColor: '#81C14B' }}
                >
                  Start Earning <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

Home.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
