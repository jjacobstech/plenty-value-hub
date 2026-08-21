/**
 * Shared payout method constants across frontend and backend
 */

export const PAYOUT_METHODS = [
  {
    key: 'bank',
    label: 'Bank',
    description: 'Direct bank transfer',
  },
  {
    key: 'mobile_money',
    label: 'Mobile Money',
    description: 'MTN, Airtel, Vodafone, M-Pesa, etc.',
  },
  {
    key: 'paypal',
    label: 'PayPal',
    description: 'PayPal account payout',
  },
  {
    key: 'stripe',
    label: 'Stripe',
    description: 'Stripe Connect account',
  },
  {
    key: 'paystack',
    label: 'Paystack',
    description: 'Paystack recipient account',
  },
  {
    key: 'flutterwave',
    label: 'Flutterwave',
    description: 'Flutterwave recipient account',
  },
]

export const MOBILE_MONEY_PROVIDERS = [
  { key: 'mtn', label: 'MTN Mobile Money' },
  { key: 'airtel', label: 'Airtel Money' },
  { key: 'vodafone', label: 'Vodafone Cash' },
  { key: 'orange', label: 'Orange Money' },
  { key: 'mpesa', label: 'M-Pesa' },
  { key: 'other', label: 'Other' },
]

export default {
  PAYOUT_METHODS,
  MOBILE_MONEY_PROVIDERS,
}
