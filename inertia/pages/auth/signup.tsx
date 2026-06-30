import React, { useState } from 'react'
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
  Users,
  CheckCircle,
} from 'lucide-react'
import GoogleIcon from '@/components/GoogleIcon'

const ACCOUNT_TYPES = [
  {
    value: 'vendor',
    icon: ShoppingBag,
    title: 'Vendor Account',
    subtitle: 'Sell products',
    perks: ['List & manage products', 'Access vendor dashboard', 'Tap into affiliate network'],
    bgColor: 'hsl(220, 100%, 13%)',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
  },
  {
    value: 'affiliate',
    icon: TrendingUp,
    title: 'Affiliate Account',
    subtitle: 'Promote & earn',
    perks: ['Generate referral links', 'Track commissions', 'Earn up to 50% commission'],
    bgColor: 'hsl(92, 47%, 52%)',
    bgClass: 'bg-secondary/10',
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
                className="group text-left bg-white/50 rounded-xl sm:rounded-2xl shadow-md border-2 border-transparent p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] transform-gpu will-change-transform"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = type.bgColor)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 transform-gpu will-change-transform ${type.bgClass}`}
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
