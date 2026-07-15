import React, { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'
import GoogleIcon from '@/components/GoogleIcon'
import BrandLogo from '@/components/shared/BrandLogo'

const ACCOUNT_TYPES = [
  {
    value: 'vendor',
    icon: ShoppingBag,
    title: 'Vendor Account',
    subtitle: 'Sell products',
    perks: ['List & manage products', 'Access vendor dashboard', 'Tap into affiliate network'],
    color: '#001845',
    bg: '#001845',
  },
  {
    value: 'affiliate',
    icon: TrendingUp,
    title: 'Affiliate Account',
    subtitle: 'Promote & earn',
    perks: ['Generate referral links', 'Track commissions', 'Earn up to 50% commission'],
    color: '#81C14B',
    bg: '#81C14B',
  },
]

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 pr-10 h-12"
        required
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function Signup() {
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [accountType, setAccountType] = useState('')

  const { data, setData, post, processing, errors } = useForm({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    role: '',
  })

  const handleTypeSelect = (type: string) => {
    setAccountType(type)
    setData('role', type)
    setStep('form')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const account = params.get('account')
    if (account === 'vendor' || account === 'affiliate') {
      handleTypeSelect(account)
    }
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/auth/signup')
  }

  const selected = ACCOUNT_TYPES.find((t) => t.value === accountType)

  // ── Account Type Selection ──
  if (step === 'type') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ backgroundColor: '#f8fafc' }}
      >
        <div className="w-full max-w-2xl">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl shadow-md p-3">
              <BrandLogo size={40} linkTo="/" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#001845' }}>
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2">Choose how you'd like to join Plenty Value</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
                className="group text-left bg-white rounded-2xl shadow-md border-2 border-transparent p-7 transition-all duration-200 hover:shadow-xl"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = type.color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: type.bg + '18' }}
                >
                  <type.icon className="w-7 h-7" style={{ color: type.color }} />
                </div>
                <h3 className="font-bold text-xl mb-1" style={{ color: '#001845' }}>
                  {type.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">{type.subtitle}</p>
                <ul className="space-y-2">
                  {type.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: type.color }}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
                <div
                  className="mt-6 flex items-center gap-2 text-sm font-semibold"
                  style={{ color: type.color }}
                >
                  Get started <span>→</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium hover:underline"
              style={{ color: '#001845' }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Registration Form ──
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl shadow-md p-3">
            <BrandLogo size={36} linkTo="/" />
          </div>
        </div>

        {/* Account type indicator */}
        {selected && (
          <div
            className="flex items-center gap-3 bg-white rounded-xl border p-3 mb-5 shadow-sm cursor-pointer"
            onClick={() => setStep('type')}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: selected.bg + '18' }}
            >
              <selected.icon className="w-5 h-5" style={{ color: selected.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#001845' }}>
                {selected.title}
              </p>
              <p className="text-xs text-muted-foreground">Click to change account type</p>
            </div>
            <span className="text-xs text-muted-foreground">← Change</span>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#001845' }}>
            Create your account
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign up to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          {Object.values(errors).some(Boolean) && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {Object.values(errors).find(Boolean)}
            </div>
          )}

          <Link href={`/auth/google?role=${accountType}`}>
            <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6">
              <GoogleIcon className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </Link>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="Your full name"
                value={data.fullName}
                onChange={(e) => setData('fullName', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm Password</Label>
              <PasswordInput
                id="passwordConfirmation"
                value={data.passwordConfirmation}
                onChange={(e) => setData('passwordConfirmation', e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-medium text-white"
              style={{ backgroundColor: selected?.color || '#001845' }}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium hover:underline"
            style={{ color: '#001845' }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
