/**
 * Frontend Product Validator
 * Mirrors backend validator rules from app/validators/product.ts
 * No external dependencies - pure TypeScript
 */

// Categories must match backend
const CATEGORIES = [
  'health_fitness',
  'business_investing',
  'software_saas',
  'ecommerce',
  'education',
  'fashion',
  'beauty',
  'home_garden',
  'technology',
  'finance',
  'digital_services',
  'ai_tools',
  'productivity',
  'lifestyle',
] as const

const PRODUCT_TYPES = ['digital', 'physical', 'service'] as const
const BILLING_CYCLES = ['one_time', 'monthly', 'yearly'] as const

export type CreateProductInput = {
  name: string
  description?: string
  shortDescription?: string
  category: (typeof CATEGORIES)[number]
  productType: (typeof PRODUCT_TYPES)[number]
  price: number | string
  salePrice?: number | string
  commissionRate: number | string
  imageUrl?: string
  recurringBilling?: boolean
  billingCycle?: (typeof BILLING_CYCLES)[number]
}

export type UpdateProductInput = Partial<CreateProductInput>

type ValidationError = { [field: string]: string[] }

/**
 * Validation helper - parse string to number safely
 */
function parseNumber(val: unknown): { success: boolean; value?: number } {
  if (val === '' || val === null || val === undefined) {
    return { success: false }
  }

  const num = typeof val === 'string' ? parseFloat(val) : (val as number)
  if (isNaN(num)) {
    return { success: false }
  }

  return { success: true, value: num }
}

/**
 * Validate product data
 * @param data - Data to validate
 * @param isUpdate - Whether this is an update (all fields optional) or create (required fields needed)
 * @returns { success, data, errors }
 */
export function validateProduct(
  data: unknown,
  isUpdate: boolean = false
): {
  success: boolean
  data?: CreateProductInput | UpdateProductInput
  errors?: ValidationError
} {
  const errors: ValidationError = {}
  const validatedData: any = {}

  if (typeof data !== 'object' || data === null) {
    return { success: false, errors: { global: ['Invalid data format'] } }
  }

  const d = data as Record<string, unknown>

  // Validate name
  const name = d.name
  if (!isUpdate || name !== undefined) {
    if (typeof name !== 'string') {
      errors.name = ['Product name is required']
    } else {
      const trimmed = name.trim()
      if (trimmed.length < 3) {
        errors.name = ['Product name must be at least 3 characters']
      } else if (trimmed.length > 255) {
        errors.name = ['Product name must not exceed 255 characters']
      } else {
        validatedData.name = trimmed
      }
    }
  }

  // Validate description
  if (d.description !== undefined) {
    if (d.description === '') {
      validatedData.description = undefined
    } else if (typeof d.description === 'string') {
      const trimmed = d.description.trim()
      if (trimmed.length < 10) {
        errors.description = ['Description must be at least 10 characters']
      } else {
        validatedData.description = trimmed
      }
    } else {
      errors.description = ['Description must be a string']
    }
  }

  // Validate shortDescription
  if (d.shortDescription !== undefined) {
    if (d.shortDescription === '') {
      validatedData.shortDescription = undefined
    } else if (typeof d.shortDescription === 'string') {
      const trimmed = d.shortDescription.trim()
      if (trimmed.length > 500) {
        errors.shortDescription = ['Short description must not exceed 500 characters']
      } else {
        validatedData.shortDescription = trimmed
      }
    } else {
      errors.shortDescription = ['Short description must be a string']
    }
  }

  // Validate category
  if (!isUpdate || d.category !== undefined) {
    if (!CATEGORIES.includes(d.category as any)) {
      errors.category = ['Invalid category selected']
    } else {
      validatedData.category = d.category
    }
  }

  // Validate productType
  if (!isUpdate || d.productType !== undefined) {
    if (!PRODUCT_TYPES.includes(d.productType as any)) {
      errors.productType = ['Invalid product type selected']
    } else {
      validatedData.productType = d.productType
    }
  }

  // Validate price
  if (!isUpdate || d.price !== undefined) {
    const priceResult = parseNumber(d.price)
    if (!priceResult.success || priceResult.value! < 0.01) {
      errors.price = ['Price must be a valid number greater than or equal to $0.01']
    } else {
      validatedData.price = priceResult.value
    }
  }

  // Validate salePrice (optional)
  if (d.salePrice !== undefined && d.salePrice !== '') {
    const saleResult = parseNumber(d.salePrice)
    if (!saleResult.success || saleResult.value! < 0.01) {
      errors.salePrice = ['Sale price must be a valid number greater than or equal to $0.01']
    } else {
      validatedData.salePrice = saleResult.value
    }
  } else if (d.salePrice === '') {
    validatedData.salePrice = undefined
  }

  // Validate commissionRate
  if (!isUpdate || d.commissionRate !== undefined) {
    const commResult = parseNumber(d.commissionRate)
    if (!commResult.success) {
      errors.commissionRate = ['Commission rate must be a valid number']
    } else if (commResult.value! < 0) {
      errors.commissionRate = ['Commission rate must be at least 0%']
    } else if (commResult.value! > 100) {
      errors.commissionRate = ['Commission rate must not exceed 100%']
    } else {
      validatedData.commissionRate = commResult.value
    }
  }

  // Validate imageUrl (optional)
  if (d.imageUrl !== undefined && d.imageUrl !== '') {
    if (typeof d.imageUrl !== 'string') {
      errors.imageUrl = ['Image URL must be a string']
    } else {
      try {
        new URL(d.imageUrl)
        validatedData.imageUrl = d.imageUrl
      } catch {
        errors.imageUrl = ['Image URL must be a valid URL']
      }
    }
  }

  // Validate recurringBilling
  if (d.recurringBilling !== undefined) {
    if (typeof d.recurringBilling === 'boolean') {
      validatedData.recurringBilling = d.recurringBilling
    } else if (d.recurringBilling === 'false' || d.recurringBilling === false) {
      validatedData.recurringBilling = false
    } else if (d.recurringBilling === 'true' || d.recurringBilling === true) {
      validatedData.recurringBilling = true
    }
  }

  // Validate billingCycle (optional, but dependent on recurringBilling)
  if (d.billingCycle !== undefined && d.billingCycle !== '') {
    if (!BILLING_CYCLES.includes(d.billingCycle as any)) {
      errors.billingCycle = ['Invalid billing cycle selected']
    } else {
      validatedData.billingCycle = d.billingCycle
    }
  }

  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

/**
 * Get first error message for a field
 * Useful for displaying single error at a time
 */
export function getFieldError(
  errors: ValidationError | undefined,
  fieldName: string
): string | undefined {
  return errors?.[fieldName]?.[0]
}

/**
 * Check if a field has errors
 */
export function hasFieldError(errors: ValidationError | undefined, fieldName: string): boolean {
  return Boolean(errors?.[fieldName]?.length)
}

/**
 * Get all errors for a field as a comma-separated string
 */
export function getFieldErrorMessage(
  errors: ValidationError | undefined,
  fieldName: string
): string {
  return errors?.[fieldName]?.join(', ') || ''
}
