type ProductFormValues = {
  name?: string
  description?: string
  short_description?: string
  category?: string
  product_type?: string
  price?: string | number
  sale_price?: string | number | null
  commission_rate?: string | number
  image_url?: string | null
  recurring_billing?: boolean
  billing_cycle?: string
  vendor_id?: number | string | null
  vendor_name?: string | null
}

export function normalizeProductPayload(
  form: ProductFormValues,
  user: { id?: number | string; fullName?: string | null } = {}
) {
  const priceValue =
    form.price === '' || form.price === null || form.price === undefined
      ? null
      : Number.parseFloat(String(form.price))

  const salePriceValue =
    form.sale_price === '' || form.sale_price === null || form.sale_price === undefined
      ? null
      : Number.parseFloat(String(form.sale_price))

  const commissionRateValue =
    form.commission_rate === '' ||
    form.commission_rate === null ||
    form.commission_rate === undefined
      ? 0
      : Number.parseFloat(String(form.commission_rate))

  return {
    name: form.name,
    description: form.description,
    shortDescription: form.short_description ?? '',
    category: form.category,
    productType: form.product_type,
    price: priceValue,
    salePrice: salePriceValue,
    commissionRate: commissionRateValue,
    imageUrl: form.image_url || null,
    recurringBilling: Boolean(form.recurring_billing),
    billingCycle: form.billing_cycle,
    vendorId: form.vendor_id ?? user.id ?? null,
    vendorName: form.vendor_name ?? user.fullName ?? 'Vendor',
  }
}
