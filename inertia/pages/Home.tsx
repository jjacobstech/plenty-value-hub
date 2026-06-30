import React, { useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/api/http-client'
import ProductCard from '@/components/shared/ProductCard'
import PublicLayout from '@/components/layout/PublicLayout'
import {
  ArrowRight,
  Star,
  TrendingUp,
  ShoppingBag,
  Users,
  ChevronRight,
  Globe,
  BookOpen,
  MailOpen,
  CheckCircle,
  Award,
  Target,
  Package,
  Link2,
  BarChart3,
  DollarSign,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const CATEGORIES = [
  {
    label: 'Health & Fitness',
    value: 'health_fitness',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop',
  },
  {
    label: 'Business',
    value: 'business_investing',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80&fit=crop',
  },
  {
    label: 'Software',
    value: 'software_saas',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80&fit=crop',
  },
  {
    label: 'Education',
    value: 'education',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80&fit=crop',
  },
  {
    label: 'Technology',
    value: 'technology',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80&fit=crop',
  },
  {
    label: 'AI Tools',
    value: 'ai_tools',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80&fit=crop',
  },
  {
    label: 'Fashion',
    value: 'fashion',
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80&fit=crop',
  },
  {
    label: 'Lifestyle',
    value: 'lifestyle',
    img: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80&fit=crop',
  },
]

const STATS = [
  { label: 'Active Products', value: '1,000+', icon: ShoppingBag },
  { label: 'Active Subscribers', value: '11,000+', icon: Users },
  { label: 'Monthly Sales', value: '$3K+', icon: TrendingUp },
  { label: 'Countries', value: '2+', icon: Globe },
]

const VENDOR_STEPS = [
  {
    icon: ShoppingBag,
    title: 'Create a Vendor Account',
    desc: 'Sign up and select Vendor as your account type.',
  },
  {
    icon: CheckCircle,
    title: 'Complete KYC Verification',
    desc: 'Verify your business details to unlock selling privileges.',
  },
  {
    icon: Package,
    title: 'List Products',
    desc: 'Upload your products, set pricing and commission rates.',
  },
  {
    icon: BarChart3,
    title: 'Receive Orders',
    desc: 'Affiliates promote your products and orders flow in automatically.',
  },
  {
    icon: DollarSign,
    title: 'Manage Sales & Earnings',
    desc: 'Track performance, manage inventory, and get paid.',
  },
]

const AFFILIATE_STEPS = [
  {
    icon: Users,
    title: 'Create an Affiliate Account',
    desc: 'Sign up and select Affiliate as your account type.',
  },
  {
    icon: ShoppingBag,
    title: 'Browse Products',
    desc: 'Explore our curated marketplace and choose products to promote.',
  },
  {
    icon: Link2,
    title: 'Generate Affiliate Links',
    desc: 'Create unique tracking links for any product in one click.',
  },
  {
    icon: Globe,
    title: 'Promote Products',
    desc: 'Share links via social media, email, content, or any channel.',
  },
  {
    icon: DollarSign,
    title: 'Earn Commissions',
    desc: 'Get paid up to 50% commission for every sale you drive.',
  },
]

const NEWSLETTER_BENEFITS = [
  { icon: BookOpen, text: 'In-depth product reviews & buying guides' },
  { icon: Target, text: 'Product comparisons before you buy' },
  { icon: Award, text: 'Expert consumer insights & recommendations' },
  { icon: MailOpen, text: 'Exclusive deals delivered to your inbox' },
]

type HomeProps = {
  featuredProducts: any[]
  trendingProducts: any[]
}

export default function Home({ featuredProducts = [], trendingProducts = [] }: HomeProps) {
  const [email, setEmail] = useState('')
  const [activeTab, setActiveTab] = useState('vendors')

  const handleSubscribe = async () => {
    if (!email) return
    try {
      await apiClient.post('/newsletters', { email, source: 'homepage' })
      toast.success("Welcome! You're now subscribed.")
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    }
  }

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : trendingProducts

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden min-h-[88vh] flex items-center"
        style={{ backgroundColor: '#001845' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=85&fit=crop"
            alt="African woman entrepreneur shopping"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001845]/92 via-[#001845]/72 to-[#001845]/30" />
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
                Africa's #1 Affiliate Marketplace
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight"
            >
              Discover, Promote &
              <span className="block" style={{ color: '#81C14B' }}>
                Earn with Plenty Value
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-200 max-w-xl leading-relaxed"
            >
              The trusted marketplace connecting consumers with quality products, vendors with
              growth, and affiliates with income. Start your journey today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="text-base px-8 w-full sm:w-auto font-semibold shadow-lg"
                  style={{ backgroundColor: '#81C14B', color: '#fff' }}
                >
                  Explore Marketplace <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 w-full sm:w-auto border-white/60 text-white hover:bg-white/10 hover:text-white"
                >
                  Become an Affiliate
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

      {/* ── Browse Categories ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold" style={{ color: '#81C14B' }}>
                Browse Categories
              </h2>
              <p className="text-muted-foreground mt-1">Find products in your niche</p>
            </div>
            <Link
              href="/marketplace"
              className="hidden md:flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: '#001845' }}
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.value} href={`/marketplace?category=${cat.value}`}>
                <Card className="group hover:border-[#81C14B]/60 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute bottom-3 left-3 font-semibold text-white text-sm drop-shadow transition-colors duration-300 group-hover:text-[#81C14B]">
                        {cat.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {displayProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold" style={{ color: '#81C14B' }}>
                  Featured Products
                </h2>
                <p className="text-muted-foreground mt-1">Handpicked by our editorial team</p>
              </div>
              <Link
                href="/marketplace"
                className="hidden md:flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: '#001845' }}
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works (Tabbed) ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
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
              Built for Vendors & Affiliates
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Plenty Value makes it simple to sell, promote, and earn — for everyone.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white border border-border rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('vendors')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'vendors' ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                style={activeTab === 'vendors' ? { backgroundColor: '#001845' } : {}}
              >
                <ShoppingBag className="w-4 h-4" /> Vendors
              </button>
              <button
                onClick={() => setActiveTab('affiliates')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'affiliates' ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                style={activeTab === 'affiliates' ? { backgroundColor: '#81C14B' } : {}}
              >
                <TrendingUp className="w-4 h-4" /> Affiliates
              </button>
            </div>
          </div>

          {/* Steps */}
          {activeTab === 'vendors' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {VENDOR_STEPS.map((step, i) => (
                  <Card
                    key={i}
                    className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#001845' }}
                        >
                          <step.icon className="w-5 h-5 text-white" />
                        </div>
                        <span
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: '#001845' }}
                        >
                          Step {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2" style={{ color: '#001845' }}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/register">
                  <Button
                    className="font-semibold px-8 text-white"
                    style={{ backgroundColor: '#001845' }}
                  >
                    Start as Vendor <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'affiliates' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {AFFILIATE_STEPS.map((step, i) => (
                  <Card
                    key={i}
                    className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#81C14B' }}
                        >
                          <step.icon className="w-5 h-5 text-white" />
                        </div>
                        <span
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: '#81C14B' }}
                        >
                          Step {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2" style={{ color: '#001845' }}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/register">
                  <Button
                    className="font-semibold px-8 text-white"
                    style={{ backgroundColor: '#81C14B' }}
                  >
                    Start as Affiliate <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── About Us ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                className="mb-4 border-0"
                style={{ backgroundColor: '#81C14B20', color: '#81C14B' }}
              >
                About Plenty Value
              </Badge>
              <h2
                className="font-display text-3xl md:text-4xl font-bold mb-6"
                style={{ color: '#001845' }}
              >
                Africa's Premier Product Review & Affiliate Marketplace
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                <span className="font-semibold text-foreground">Plenty Value</span> is a premier
                e-commerce newsletter and digital marketplace dedicated to empowering modern
                consumers with the knowledge required to make informed and strategic purchasing
                decisions. By synthesizing in-depth product evaluations with real-time market
                insights, the platform serves as a critical bridge between high-quality brands and a
                discerning audience.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As the digital landscape becomes increasingly saturated, Plenty Value distinguishes
                itself through a commitment to transparency, reliability, and value-driven content.
                Our mission is to help consumers discover trusted products, maximize value, and make
                confident purchasing decisions while enabling brands to connect with highly engaged
                audiences.
              </p>
              <div className="flex flex-wrap gap-6 mt-8">
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#001845' }}>
                    11,000+
                  </p>
                  <p className="text-sm text-muted-foreground">Active Subscribers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#81C14B' }}>
                    1,000+
                  </p>
                  <p className="text-sm text-muted-foreground">Products Listed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#001845' }}>
                    50%
                  </p>
                  <p className="text-sm text-muted-foreground">Max Commission</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=85&fit=crop"
                alt="African woman entrepreneur"
                className="rounded-2xl shadow-2xl w-full object-cover h-[420px]"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#81C14B' }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: '#001845' }}>
                    11,000+
                  </p>
                  <p className="text-xs text-muted-foreground">Active Subscribers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter Value Section ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#001845' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                className="mb-4 border-0 text-sm"
                style={{ backgroundColor: '#81C14B', color: '#fff' }}
              >
                11,000+ Active Subscribers
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Helping Subscribers Make Smarter Buying Decisions
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Expert product reviews, buying guides, and consumer insights — delivered directly to
                your inbox. Compare products before you buy and never waste money on the wrong
                purchase again.
              </p>
              <div className="space-y-4 mb-8">
                {NEWSLETTER_BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(129,193,75,0.2)' }}
                    >
                      <b.icon className="w-4 h-4" style={{ color: '#81C14B' }} />
                    </div>
                    <span className="text-slate-200 text-sm">{b.text}</span>
                  </div>
                ))}
              </div>
              {/* Subscribe form */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-[#81C14B] h-12"
                />
                <Button
                  onClick={handleSubscribe}
                  className="shrink-0 h-12 px-6 font-semibold"
                  style={{ backgroundColor: '#81C14B', color: '#fff' }}
                >
                  Subscribe Free
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Join 11,000+ subscribers. No spam, ever.
              </p>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1596460107916-430662021049?w=700&q=85&fit=crop"
                alt="Consumer making informed decisions"
                className="rounded-2xl w-full object-cover h-[460px] opacity-90"
              />
              {/* Social proof card */}
              <div className="absolute top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  "Best product newsletter in Africa"
                </p>
                <p className="text-xs text-muted-foreground mt-1">— Verified Subscriber</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

Home.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
