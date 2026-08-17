# Payment Provider Logos

This directory contains official brand logos for payment providers.

⚠️ **IMPORTANT**: These are registered trademarks. Only official SVGs from each provider should be used here.

## Required Files

- [ ] `stripe.svg` - Official Stripe logo
- [ ] `paypal.svg` - Official PayPal logo
- [ ] `flutterwave.svg` - Official Flutterwave logo
- [ ] `paystack.svg` - Official Paystack logo

## File Sources & License

### Stripe

- **Source**: [Stripe Brand Resources](https://stripe.com/docs/branding/stripe-brand-resources)
- **License**: ™ and © Stripe, Inc.
- **Usage**: Follow Stripe's official brand guidelines

### PayPal

- **Source**: [PayPal Brand Guidance](https://www.paypal.com/en/business/tools/brand-guidance)
- **License**: ™ and © PayPal, Inc.
- **Usage**: Follow PayPal's official brand guidelines

### Flutterwave

- **Source**: [Flutterwave Brand Guidelines](https://developer.flutterwave.com/docs/brand-guidelines)
- **License**: ™ and © Flutterwave, Inc.
- **Usage**: Follow Flutterwave's official brand guidelines

### Paystack

- **Source**: [Paystack Brand](https://paystack.com/brand)
- **License**: ™ and © Paystack, Inc.
- **Usage**: Follow Paystack's official brand guidelines

## Implementation

These SVGs are imported into React components via Vite's SVGR plugin:

```typescript
import { ReactComponent as StripeLogo } from '@/assets/logos/stripe.svg'
```

This allows:

- SVG inheritance of CSS colors (where brand permits)
- Proper sizing with `preserveAspectRatio`
- Full accessibility support
- No extra HTTP requests

## Brand Constraints

All logos MUST respect:

- **Minimum clear space**: 25% of logo height on all sides
- **Minimum height**: As specified in `config/paymentProviders.ts`
- **No distortion**: Never stretch, skew, or rotate logos
- **Solid backgrounds only**: No gradients or images behind logos
- **High contrast**: Place on solid surface colors only

## Getting Official Files

1. **Stripe**: Visit https://stripe.com/docs/branding/stripe-brand-resources
   - Download the SVG version
   - Choose the "Wordmark with icon" or "Icon only" variant as needed

2. **PayPal**: Visit https://www.paypal.com/en/business/tools/brand-guidance
   - Download the "Logo" package
   - Select the SVG format

3. **Flutterwave**: Visit https://developer.flutterwave.com/docs/brand-guidelines
   - Request brand assets or check documentation
   - Use official SVG files only

4. **Paystack**: Visit https://paystack.com/brand
   - Download logo assets
   - Choose appropriate format (SVG preferred)

## Do NOT

❌ Hand-draw or reconstruct logo paths
❌ Use emoji or text substitutes
❌ Apply CSS transforms that distort the logo
❌ Change logo colors outside brand guidelines
❌ Place logos on gradients or complex backgrounds
❌ Use outdated or unofficial logo versions

## Questions?

If a logo file is missing or unclear, contact the payment provider directly or update this README with sourcing information.
