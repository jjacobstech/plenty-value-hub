import React from 'react'
import { usePage } from '@inertiajs/react'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BrandLogo from '@/components/shared/BrandLogo'

const ERROR_MESSAGES: Record<string, string> = {
  admin_exists: 'An admin account already exists. Only one admin is allowed.',
  email_taken: 'That Google account is already registered under a different role.',
  not_registered: 'No admin account found for that Google address.',
  not_admin: 'That Google account does not have admin access.',
  access_denied: 'Google sign-in was cancelled.',
  state_mismatch: 'Authentication state mismatch. Please try again.',
  oauth_error: 'Google authentication failed. Please try again.',
  no_email: 'Google did not provide an email address.',
}

type AdminLoginProps = {
  adminExists: boolean
}

export default function AdminLogin({ adminExists }: AdminLoginProps) {
  const { url } = usePage()
  const params = new URLSearchParams(url.split('?')[1] ?? '')
  const errorKey = params.get('error')
  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? 'An unexpected error occurred.') : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001845] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-3 shadow-xl">
              <BrandLogo size={36} linkTo={null} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#81C14B]" />
            <span className="text-[#81C14B] text-sm font-semibold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {adminExists ? 'Admin Sign In' : 'Set Up Admin Account'}
          </h1>
          <p className="text-white/55 text-sm mt-1">
            {adminExists
              ? 'Sign in with the registered admin Google account.'
              : 'No admin account exists yet. Create the first one.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          {errorMessage && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {!adminExists && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <p className="text-sm text-amber-800">
                <strong>First-time setup:</strong> The Google account you sign in with will become
                the permanent admin account. Only one admin is allowed.
              </p>
            </div>
          )}

          <a
            href={adminExists ? '/admin/auth/login/google' : '/admin/auth/setup/google'}
            className="block"
          >
            <Button className="w-full h-11 gap-3 font-semibold" style={{ backgroundColor: '#001845', color: '#fff' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {adminExists ? 'Sign in with Google' : 'Set Up with Google'}
            </Button>
          </a>

          {adminExists && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Only the registered admin Google account can sign in here.
            </p>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Plenty Value · Admin Portal · Restricted Access
        </p>
      </div>
    </div>
  )
}
