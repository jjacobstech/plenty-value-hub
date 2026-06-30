import React, { useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import GoogleIcon from '@/components/GoogleIcon'

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

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-3 sm:px-4 py-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Log in to your account</p>
        </div>
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-8">
          {(errors.email || errors.password) && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {errors.email || errors.password}
            </div>
          )}

          <Link href="/auth/google?source=login">
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
              <span className="bg-card px-3 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                autoComplete="current-password"
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
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
