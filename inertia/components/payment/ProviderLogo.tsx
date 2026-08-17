import React from 'react'
import {
  getProviderConfig,
  getClampedLogoHeight,
  type PaymentProviderId,
} from '#config/paymentProviders'

/**
 * Payment Provider Logo Component
 *
 * Renders official SVG logos for payment providers with proper sizing,
 * spacing, and accessibility support.
 *
 * Key features:
 * - Loads official SVGs from public/logos/
 * - Enforces minimum/maximum height constraints
 * - Maintains 25% clear space around logo
 * - No CSS transforms that distort the logo
 * - Full accessibility with aria-label
 *
 * @param provider - Payment provider ID ('stripe' | 'paypal' | 'flutterwave' | 'paystack')
 * @param variant - Logo variant: 'full' (with wordmark) or 'mark' (icon only)
 * @param size - Height in pixels (default: 24, clamped to provider's min/max)
 * @param className - Additional Tailwind classes (spacing only, never transforms)
 * @param ariaLabel - Custom aria-label (defaults to provider name)
 * @param role - ARIA role (defaults to 'img' for logos)
 */
interface ProviderLogoProps {
  provider: PaymentProviderId
  variant?: 'full' | 'mark'
  size?: number
  className?: string
  ariaLabel?: string
  role?: string
}

export const ProviderLogo: React.FC<ProviderLogoProps> = ({
  provider,
  variant = 'full',
  size = 24,
  className = '',
  ariaLabel,
  role = 'img',
}) => {
  try {
    // Get provider config and clamp size
    const config = getProviderConfig(provider)
    const clampedHeight = getClampedLogoHeight(provider, size)

    // Calculate clear space (25% of height)
    const clearSpace = Math.ceil((clampedHeight * 0.25) / 8) * 8 // Round to 8px for Tailwind
    const spacingClass = `p-${clearSpace / 4}` // Convert to Tailwind scale (4px units)

    // Default aria-label
    const label = ariaLabel || `${config.displayName} logo`

    // Construct logo filename
    const logoFilename = `${provider}.svg`
    const logoPath = `/logos/${logoFilename}`

    return (
      <div
        className={`
          inline-flex 
          items-center 
          justify-center
          bg-white
          rounded
          ${className}
        `}
        style={{
          padding: `${(clampedHeight * 0.25) / 2}px`,
        }}
      >
        <svg
          role={role}
          aria-label={label}
          height={clampedHeight}
          width="auto"
          viewBox="0 0 64 64"
          className="block"
          style={{
            preserveAspectRatio: 'xMidYMid meet',
            display: 'block',
            height: `${clampedHeight}px`,
            width: 'auto',
          }}
        >
          <use href={`${logoPath}#logo`} />
        </svg>
      </div>
    )
  } catch (error) {
    console.error(`[ProviderLogo] Error rendering logo for ${provider}:`, error)

    // Fallback: render provider name in a box
    return (
      <div
        role="img"
        aria-label={ariaLabel || `${provider} logo (unavailable)`}
        className={`
          inline-flex 
          items-center 
          justify-center
          bg-gray-100 
          border 
          border-gray-300 
          rounded 
          text-xs 
          font-semibold 
          text-gray-600
          ${className}
        `}
        style={{
          height: `${getClampedLogoHeight(provider, size)}px`,
          minWidth: `${getClampedLogoHeight(provider, size) * 1.5}px`,
        }}
      >
        {provider.toUpperCase().slice(0, 3)}
      </div>
    )
  }
}

/**
 * Inline logo variant - smaller, no container padding
 * Useful for text-adjacent or table cell usage
 */
export const ProviderLogoInline: React.FC<Omit<ProviderLogoProps, 'variant'>> = (props) => {
  return (
    <svg
      role="img"
      aria-label={props.ariaLabel || `${props.provider} logo`}
      height={getClampedLogoHeight(props.provider, props.size || 24)}
      width="auto"
      viewBox="0 0 64 64"
      className={`inline-block ${props.className || ''}`}
      style={{
        preserveAspectRatio: 'xMidYMid meet',
        height: `${getClampedLogoHeight(props.provider, props.size || 24)}px`,
      }}
    >
      <use href={`/logos/${props.provider}.svg#logo`} />
    </svg>
  )
}

export default ProviderLogo
