import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * BrandLogo — renders the logo mark, wordmark, or both.
 * variant: 'logo' | 'wordmark' | 'combined' (default)
 * size: height in px (default 36)
 * darkBg: boolean — wraps logo in a white pill for visibility on dark surfaces
 */
export default function BrandLogo({ variant = 'combined', size = 36, className = '', linkTo = '/', darkBg = false }) {
  const logoUrl = 'https://media.base44.com/images/public/6a235579fdf4cce1a3f803a3/f40bff49e_Logo.svg';
  const wordmarkUrl = 'https://media.base44.com/images/public/6a235579fdf4cce1a3f803a3/b91f1957b_wordmark.svg';

  const inner =
  <span className={`inline-flex items-center gap-2 ${className}`}>
      {(variant === 'logo' || variant === 'combined') && (
    darkBg ?
    <span
      className="inline-flex items-center justify-center rounded-xl flex-shrink-0 hidden"
      style={{ background: '#fff', padding: 4 }}>
      
            
          </span> :

    <img src={logoUrl} alt="Plenty Value logo" style={{ height: size }} className="object-contain flex-shrink-0" />)

    }
      {(variant === 'wordmark' || variant === 'combined') && (
    darkBg ?
    <span
      className="inline-flex items-center justify-center rounded-lg flex-shrink-0 mt-1 mb-1 pl-3 pb-2 pr-3 pt-2 ml-1"
      style={{ background: '#fff', padding: '2px 6px' }}>
      
            <img src={wordmarkUrl} alt="Plenty Value" style={{ height: Math.round(size * 0.6) }} className="object-contain mx-8" />
          </span> :

    <img src={wordmarkUrl} alt="Plenty Value" style={{ height: Math.round(size * 0.65) }} className="object-contain flex-shrink-0" />)

    }
    </span>;


  if (linkTo) {
    return <Link href={linkTo} className="inline-flex items-center">{inner}</Link>;
  }
  return inner;
}