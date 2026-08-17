import React, { useState, useRef, useCallback } from 'react'
import { getEnabledProviders, type PaymentProviderId } from '#config/paymentProviders'
import { ProviderLogo } from './ProviderLogo'
import { CheckCircle2 } from 'lucide-react'

/**
 * Accessible Payment Provider Selector
 *
 * Features:
 * - ARIA radio group with roving tabindex
 * - Arrow-key navigation (Up/Down/Left/Right)
 * - Visual selection border (not color overlay on logo)
 * - No grayscale on unselected providers
 * - Keyboard accessible (Enter/Space to select)
 * - Full screen reader support
 *
 * @param onSelect - Callback when provider is selected
 * @param value - Currently selected provider ID
 * @param showCurrencies - Whether to show supported currencies
 * @param label - Fieldset label (screen reader + UI)
 * @param description - Additional description text
 */
interface ProviderSelectorProps {
  onSelect: (providerId: PaymentProviderId) => void
  value?: PaymentProviderId
  showCurrencies?: boolean
  label?: string
  description?: string
  className?: string
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  onSelect,
  value,
  showCurrencies = false,
  label = 'Payment Method',
  description,
  className = '',
}) => {
  const providers = getEnabledProviders()
  const [focusedIndex, setFocusedIndex] = useState<number>(
    providers.findIndex((p) => p.id === value) || 0
  )
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([])

  // Handle keyboard navigation with arrow keys
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let newIndex = index

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          newIndex = (index - 1 + providers.length) % providers.length
          event.preventDefault()
          break
        case 'ArrowDown':
        case 'ArrowRight':
          newIndex = (index + 1) % providers.length
          event.preventDefault()
          break
        case 'Home':
          newIndex = 0
          event.preventDefault()
          break
        case 'End':
          newIndex = providers.length - 1
          event.preventDefault()
          break
        case 'Enter':
        case ' ':
          onSelect(providers[index].id)
          event.preventDefault()
          return
        default:
          return
      }

      setFocusedIndex(newIndex)
      optionsRef.current[newIndex]?.focus()
    },
    [providers, onSelect]
  )

  const handleClick = (providerId: PaymentProviderId, index: number) => {
    onSelect(providerId)
    setFocusedIndex(index)
    optionsRef.current[index]?.focus()
  }

  return (
    <fieldset className={`space-y-3 ${className}`}>
      <legend className="text-sm font-semibold text-gray-900">{label}</legend>

      {description && <p className="text-xs text-gray-600">{description}</p>}

      <div
        role="radiogroup"
        aria-labelledby="provider-legend"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {providers.map((provider, index) => {
          const isSelected = value === provider.id
          const isFocused = focusedIndex === index

          return (
            <button
              key={provider.id}
              ref={(el) => {
                optionsRef.current[index] = el
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${provider.displayName}${showCurrencies ? ` - ${provider.supportedCurrencies.join(', ')}` : ''}`}
              tabIndex={isFocused ? 0 : -1}
              onClick={() => handleClick(provider.id, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                relative
                flex
                flex-col
                items-center
                gap-2
                rounded-lg
                border-2
                p-3
                transition-all
                duration-200
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-blue-500
              ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
              `}
            >
              {/* Logo */}
              <ProviderLogo
                provider={provider.id}
                size={32}
                ariaLabel={`${provider.displayName} logo`}
              />

              {/* Provider Name */}
              <span className="text-xs font-medium text-gray-900">{provider.displayName}</span>

              {/* Currencies (optional) */}
              {showCurrencies && (
                <span className="text-[10px] text-gray-500 text-center line-clamp-2">
                  {provider.supportedCurrencies.slice(0, 2).join(', ')}
                  {provider.supportedCurrencies.length > 2 ? '+' : ''}
                </span>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-0.5">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Keyboard Help Text */}
      <p className="text-xs text-gray-500 pt-2">
        Use arrow keys to navigate • Press Enter to select
      </p>
    </fieldset>
  )
}

export default ProviderSelector
