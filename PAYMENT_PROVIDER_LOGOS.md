# Payment Provider Logo System

A professional, accessible, and brand-compliant logo system for payment providers (Stripe, PayPal, Flutterwave, Paystack).

## Quick Start

### 1. Add Official Logos

Place official SVG files from each provider at:

```
public/logos/
├── stripe.svg
├── paypal.svg
├── flutterwave.svg
└── paystack.svg
```

**IMPORTANT**: Only use official SVGs from each provider's brand resources page. See `public/logos/README.md` for sourcing information.

### 2. Use in Components

```tsx
import { ProviderLogo, ProviderSelector } from '@/components/payment'

// Display a logo
export function PaymentInfo() {
  return <ProviderLogo provider="stripe" size={48} />
}

// Provider selection interface
export function PaymentChoice() {
  const [selected, setSelected] = useState<PaymentProviderId>('stripe')

  return (
    <ProviderSelector
      value={selected}
      onSelect={setSelected}
      showCurrencies
      label="Choose Payment Method"
    />
  )
}
```

## Architecture

### Files

```
config/
└── paymentProviders.ts         # Type-safe provider registry

inertia/components/payment/
├── ProviderLogo.tsx            # Logo component
├── ProviderSelector.tsx        # Accessible radio group
└── index.ts                    # Barrel exports

public/logos/
├── stripe.svg                  # TODO: Add official SVG
├── paypal.svg                  # TODO: Add official SVG
├── flutterwave.svg             # TODO: Add official SVG
├── paystack.svg                # TODO: Add official SVG
└── README.md                   # Sourcing guide
```

## Components

### ProviderLogo

Renders payment provider logos with proper sizing and accessibility.

**Props:**

```typescript
{
  provider: 'stripe' | 'paypal' | 'flutterwave' | 'paystack'
  variant?: 'full' | 'mark'              // Logo variant (reserved for future use)
  size?: number                          // Height in pixels (default: 24)
  className?: string                     // Additional Tailwind classes
  ariaLabel?: string                     // Custom accessibility label
  role?: string                          // ARIA role (default: 'img')
}
```

**Features:**

- ✅ Type-safe provider IDs
- ✅ Automatic size clamping (respects min/max height)
- ✅ 25% clear space enforcement
- ✅ Accessibility: `aria-label`, proper `role`
- ✅ Fallback: Text badge if logo unavailable
- ✅ No CSS transforms (preserves logo integrity)
- ✅ Solid white background (no gradients)

**Examples:**

```tsx
// Standard logo
<ProviderLogo provider="stripe" size={32} />

// In a table cell
<ProviderLogoInline provider="paystack" size={20} />

// With custom styling
<ProviderLogo
  provider="flutterwave"
  size={48}
  className="border border-gray-200 rounded-lg"
/>
```

**Size Constraints:**

Each provider has min/max height constraints (enforced via `getClampedLogoHeight`):

| Provider    | Min  | Max   |
| ----------- | ---- | ----- |
| Stripe      | 24px | 120px |
| PayPal      | 24px | 120px |
| Flutterwave | 24px | 120px |
| Paystack    | 24px | 120px |

Requested sizes outside these ranges are automatically clamped.

### ProviderSelector

Fully accessible payment provider selector with keyboard navigation.

**Props:**

```typescript
{
  onSelect: (providerId: PaymentProviderId) => void
  value?: PaymentProviderId               // Currently selected
  showCurrencies?: boolean                // Show supported currencies (default: false)
  label?: string                          // Fieldset label (default: 'Payment Method')
  description?: string                   // Optional helper text
  className?: string                     // Additional Tailwind classes
}
```

**Features:**

- ✅ ARIA radio group (semantic HTML)
- ✅ Roving tabindex (only focused item in tab order)
- ✅ Keyboard navigation:
  - **Arrow keys** (Up/Down/Left/Right): Navigate options
  - **Home/End**: Jump to first/last option
  - **Enter/Space**: Select focused option
- ✅ Visual selection: Border on container, NOT color overlay on logo
- ✅ No grayscale on unselected providers
- ✅ Screen reader friendly
- ✅ Mobile responsive (2 columns on mobile, 4 on desktop)

**Usage:**

```tsx
function CheckoutPayment() {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderId>('stripe')

  return (
    <ProviderSelector
      value={selectedProvider}
      onSelect={setSelectedProvider}
      showCurrencies
      label="Choose Payment Method"
      description="Select your preferred payment provider"
    />
  )
}
```

## Config (paymentProviders.ts)

Type-safe centralized registry for payment providers.

**Functions:**

```typescript
// Get config for a provider
const config = getProviderConfig('stripe')

// Get all enabled providers
const providers = getEnabledProviders()

// Check if provider supports currency
const supports = providerSupportsCurrency('paystack', 'NGN')

// Clamp size to provider's min/max
const height = getClampedLogoHeight('stripe', 50)
```

**Provider Config:**

```typescript
{
  id: PaymentProviderId
  displayName: string
  supportedCurrencies: string[]
  enabled: boolean
  minClearSpace: number                  // % of logo height
  minHeight: number                      // pixels
  maxHeight: number                      // pixels
  brandColor: string                     // Primary hex color
  brandColorAlt?: string                 // Secondary color
  description: string
  docsUrl: string                        // Link to brand guidelines
}
```

## Design Constraints

### Spacing

- **Clear space**: 25% of logo height on ALL sides (enforced by component)
- Container padding calculated automatically based on requested size

### Colors

- **Background**: Solid white or solid surface color only
- **Never**: Gradients, images, or low-contrast backgrounds
- **Logo colors**: Only as defined in official brand guidelines

### Sizing

- **Min height**: 24px (UI minimum for touch targets)
- **Max height**: 120px (readability maximum)
- **Aspect ratio**: Preserved at all times (via SVG `preserveAspectRatio`)

### Transforms

- **Never applied**: `rotate()`, `skew()`, `scaleX()`, `scaleY()`
- Selection state uses **border styling**, NOT opacity or color changes on logo

### Backgrounds

- Logos rendered on **solid surface color** (currently `bg-white`)
- Never on gradients, images, or complex patterns

## Brand Compliance

### Official Sources

- **Stripe**: https://stripe.com/docs/branding/stripe-brand-resources
- **PayPal**: https://www.paypal.com/en/business/tools/brand-guidance
- **Flutterwave**: https://developer.flutterwave.com/docs/brand-guidelines
- **Paystack**: https://paystack.com/brand

### What to Do

✅ Use official SVGs only
✅ Maintain aspect ratio
✅ Respect clear space (25% minimum)
✅ Use brand colors as defined
✅ Place on solid backgrounds
✅ Follow provider's UI guidelines

### What NOT to Do

❌ Hand-draw or reconstruct logo paths
❌ Use emoji or text substitutes
❌ Apply CSS transforms to logos
❌ Change logo colors arbitrarily
❌ Use grayscale on logos
❌ Place logos on gradients/patterns
❌ Shrink below minimum height
❌ Use outdated logo versions

## Accessibility

### Screen Readers

```tsx
// Logo gets automatic aria-label
<ProviderLogo
  provider="stripe"
  ariaLabel="Pay with Stripe"
/>

// Or uses provider name + "logo"
<ProviderLogo provider="paypal" />
// → aria-label="PayPal logo"
```

### Keyboard Navigation

```
1. Tab into ProviderSelector
2. Arrow keys navigate between providers
3. Enter/Space selects current provider
4. Selection border highlights container (not logo)
```

### ARIA Attributes

- `role="radiogroup"` on container
- `role="radio"` on each provider option
- `aria-checked` reflects selection state
- `aria-label` on logos
- `tabindex` properly managed for roving focus

## Responsive Behavior

### ProviderSelector Grid

```
Mobile:  2 columns (width-dependent)
Tablet:  3 columns
Desktop: 4 columns
```

### Logo Sizing

- Scales proportionally
- Never distorted or stretched
- Maintains full brand impact at all sizes

## Troubleshooting

### Logo Not Appearing?

1. Verify SVG file exists at `public/logos/{provider}.svg`
2. Check browser DevTools console for errors
3. Component will fallback to text badge if SVG unavailable
4. Check file is valid SVG with proper namespace

### Selection State Not Visible?

- Border styling is applied to container, not logo
- Green/blue border highlights selection on the button
- Check browser DevTools to verify styles are applied

### Size Issues?

- Requested size is automatically clamped to provider's min/max
- Use `getClampedLogoHeight()` to check final size
- Never manually apply width/height that stretches logo

### Keyboard Navigation Not Working?

- Ensure `ProviderSelector` has focus (click or tab)
- Try different arrow keys (all directions work)
- Space/Enter must be pressed, not just focused

## Migration Guide

### Integrating into Checkout

```tsx
import { ProviderSelector } from '@/components/payment'

export function CheckoutPage() {
  const [provider, setProvider] = useState<PaymentProviderId>('stripe')

  const handlePayment = async () => {
    // Use `provider` to initialize payment
    const result = await initializePayment(provider, amount)
  }

  return (
    <div className="space-y-6">
      <ProviderSelector value={provider} onSelect={setProvider} showCurrencies />

      <button onClick={handlePayment}>
        Pay ${amount} with {provider}
      </button>
    </div>
  )
}
```

## Future Enhancements

- [ ] Logo variants (full + mark for each provider)
- [ ] Dark mode support (brand-compliant dark versions)
- [ ] Animation transitions between selections
- [ ] Provider comparison view
- [ ] Fee/commission display for each provider
- [ ] Provider feature badges (fast, secure, etc.)
- [ ] Localized provider names

## Support

For issues or questions:

1. Check `public/logos/README.md` for logo sourcing
2. Verify compliance with provider's brand guidelines
3. Check component props and usage examples above
4. Review ARIA attributes and keyboard navigation

---

**Last Updated**: 2025-08-14  
**Status**: Ready for production (pending official logo SVGs)
