import React from 'react';
import { Link } from '@inertiajs/react';

const LOGO_URL = 'https://media.base44.com/images/public/6a235579fdf4cce1a3f803a3/f40bff49e_Logo.svg';
const WORDMARK_URL = 'https://media.base44.com/images/public/6a235579fdf4cce1a3f803a3/b91f1957b_wordmark.svg';

type BrandLogoProps = {
  variant?: 'logo' | 'wordmark' | 'combined'
  size?: number
  className?: string
  linkTo?: string | null
  darkBg?: boolean
}

export default function BrandLogo({
  variant = 'combined',
  size = 32,
  className = '',
  linkTo = '/',
  darkBg = false,
}: BrandLogoProps) {
  const wordmarkHeight = size

  const inner = (
    <span className={`inline-flex items-center ${className}`}>
      {(variant === 'logo' || variant === 'combined') && (
        <img
          src={LOGO_URL}
          alt="Plenty Value logo"
          style={{ height: size }}
          className="object-contain flex-shrink-0"
        />
      )}
      {(variant === 'wordmark' || variant === 'combined') && (
        darkBg ? (
          <span
            className="inline-flex items-center rounded-md py-0.5"
            style={{ background: '#ffffff' }}
          >
            <img
              src={WORDMARK_URL}
              alt="Plenty Value"
              style={{ height: wordmarkHeight }}
              className="object-contain"
            />
          </span>
        ) : (
          <img
            src={WORDMARK_URL}
            alt="Plenty Value"
            style={{ height: wordmarkHeight }}
            className="object-contain flex-shrink-0"
          />
        )
      )}
    </span>
  )

  if (linkTo) {
    return <Link href={linkTo} className="inline-flex items-center">{inner}</Link>
  }
  return inner
}
