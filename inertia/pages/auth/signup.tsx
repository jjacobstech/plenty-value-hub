import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useForm } from '@inertiajs/react'
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
  Users,
  CheckCircle,
} from 'lucide-react'

const ACCOUNT_TYPES = [
  {
    value: 'vendor',
    icon: ShoppingBag,
    title: 'Vendor Account',
    subtitle: 'Sell products',
    perks: ['List & manage products', 'Access vendor dashboard', 'Tap into affiliate network'],
    bgColor: 'hsl(220, 100%, 13%)',
    bgClass: 'bg-primary-foreground',
    textClass: 'text-primary',
  },
  {
    value: 'affiliate',
    icon: TrendingUp,
    title: 'Affiliate Account',
    subtitle: 'Promote & earn',
    perks: ['Generate referral links', 'Track commissions', 'Earn up to 50% commission'],
    bgColor: 'hsl(92, 47%, 52%)',
    bgClass: 'bg-secondary-foreground',
    textClass: 'text-secondary',
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/auth/signup')
  }

  const selected = ACCOUNT_TYPES.find((t) => t.value === accountType)

  // ── Account Type Selection ──
  if (step === 'type') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
        <div className="w-full max-w-2xl px-0 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2">Choose how you'd like to join Plenty Value</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
                className="group text-left bg-white/50 rounded-xl sm:rounded-2xl shadow-md border-2 border-transparent p-4 sm:p-6 transition-all duration-200 hover:shadow-xl"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = type.bgColor)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${type.bgClass}`}
                >
                  <type.icon
                    className="w-7 h-7"
                    style={{
                      color: type.bgColor,
                    }}
                  />
                </div>
                <h3 className="font-bold text-lg mb-1 text-primary">{type.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{type.subtitle}</p>
                <ul className="space-y-1.5">
                  {type.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: type.bgColor }}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 text-sm font-semibold" style={{ color: type.bgColor }}>
                  Get started →
                </div>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Registration Form ──
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Account type indicator */}
        {selected && (
          <button
            onClick={() => setStep('type')}
            className="w-full flex items-center gap-3 bg-white rounded-xl border p-3 mb-5 shadow-sm hover:bg-muted/30 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: selected.bgColor + '18' }}
            >
              <selected.icon className="w-5 h-5" style={{ color: selected.bgColor }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-primary">{selected.title}</p>
              <p className="text-xs text-muted-foreground">Click to change account type</p>
            </div>
            <span className="text-xs text-muted-foreground">← Change</span>
          </button>
        )}

        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Sign up to get started</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-8">
          {Object.values(errors).some(Boolean) && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {Object.values(errors).find(Boolean)}
            </div>
          )}

          <Link href="/auth/google">
            <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
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
              className="w-full h-12 font-medium text-white bg-primary hover:bg-primary/90"
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
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
