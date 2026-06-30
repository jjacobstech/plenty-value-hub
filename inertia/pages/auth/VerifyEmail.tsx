import React from 'react'
import { Link } from '@adonisjs/inertia/react'
import { router, usePage, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, RotateCcw } from 'lucide-react'

interface Props {
  email: string
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`
}

export default function VerifyEmail({ email }: Props) {
  const { errors, flash } = usePage().props as unknown as {
    errors: Record<string, string>
    flash: { error?: string; success?: string }
  }

  const { data, setData, post, processing } = useForm({ otpCode: '' })
  const [resending, setResending] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/auth/signup/verify-otp')
  }

  const handleResend = () => {
    setResending(true)
    router.post('/auth/signup/resend-otp', {}, { onFinish: () => setResending(false) })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-3 sm:px-4 py-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-foreground">{maskEmail(email)}</span>
          </p>
        </div>

        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-8">
          {flash?.success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">
              {flash.success}
            </div>
          )}

          {errors.otpCode && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {errors.otpCode}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otpCode">Verification code</Label>
              <Input
                id="otpCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                placeholder="000000"
                maxLength={6}
                value={data.otpCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData('otpCode', e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-medium text-white bg-primary hover:bg-primary/90"
              disabled={processing || data.otpCode.length !== 6}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify email'
              )}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">Didn&apos;t receive the code?</p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 text-sm"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resend code
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Wrong email?{' '}
          <Link href="/auth/signup" className="text-primary font-medium hover:underline">
            Sign up again
          </Link>
        </p>
      </div>
    </div>
  )
}
