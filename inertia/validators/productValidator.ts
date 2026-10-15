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

export type ProductCategory = (typeof CATEGORIES)[number]
export type ProductType = (typeof PRODUCT_TYPES)[number]
export type BillingCycle = (typeof BILLING_CYCLES)[number]

export type CreateProductInput = {
  name: string
  description?: string
  shortDescription?: string
  category: ProductCategory
  productType: ProductType
  price: number | string
  salePrice?: number | string
  commissionRate: number | string
  imageUrl?: string
  recurringBilling?: boolean
  billingCycle?: BillingCycle
}

export type UpdateProductInput = Partial<CreateProductInput>

/** A raw form value. Form fields arrive as strings, numbers, booleans or nothing. */
export type ProductFormValue = string | number | boolean | null | undefined

/** The product form as the page keeps it. Every field is optional. */
export type ProductFormInput = Partial<Record<keyof CreateProductInput, ProductFormValue>>

/** Field name to the messages for that field. */
export type ValidationError = Record<string, string[]>

export type ProductValidationResult =
  | { success: true; data: UpdateProductInput; errors?: undefined }
  | { success: false; data?: undefined; errors: ValidationError }

function isCategory(value: ProductFormValue): value is ProductCategory {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

function isProductType(value: ProductFormValue): value is ProductType {
  return typeof value === 'string' && (PRODUCT_TYPES as readonly string[]).includes(value)
}

function isBillingCycle(value: ProductFormValue): value is BillingCycle {
  return typeof value === 'string' && (BILLING_CYCLES as readonly string[]).includes(value)
}

/**
 * Parses a number from a form value. Strings are parsed; anything else that is not a finite number fails.
 */
function parseNumber(value: ProductFormValue): { success: boolean; value?: number } {
  if (value === '' || value === null || value === undefined) {
    return { success: false }
  }
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  if (isNaN(num)) {
    return { success: false }
  }
  return { success: true, value: num }
}

/**
 * Validate product data
 * @param data - Form values to validate
 * @param isUpdate - Whether this is an update (all fields optional) or create (required fields needed)
 */
export function validateProduct(data: ProductFormInput, isUpdate: boolean = false): ProductValidationResult {
  const errors: ValidationError = {}
  const validatedData: UpdateProductInput = {}

  // Validate name
  const name = data.name
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
  if (data.description !== undefined) {
    if (data.description === '') {
      validatedData.description = undefined
    } else if (typeof data.description === 'string') {
      const trimmed = data.description.trim()
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
  if (data.shortDescription !== undefined) {
    if (data.shortDescription === '') {
      validatedData.shortDescription = undefined
    } else if (typeof data.shortDescription === 'string') {
      const trimmed = data.shortDescription.trim()
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
  if (!isUpdate || data.category !== undefined) {
    if (!isCategory(data.category)) {
      errors.category = ['Invalid category selected']
    } else {
      validatedData.category = data.category
    }
  }

  // Validate productType
  if (!isUpdate || data.productType !== undefined) {
    if (!isProductType(data.productType)) {
      errors.productType = ['Invalid product type selected']
    } else {
      validatedData.productType = data.productType
    }
  }

  // Validate price
  if (!isUpdate || data.price !== undefined) {
    const priceResult = parseNumber(data.price)
    if (!priceResult.success || priceResult.value === undefined || priceResult.value < 0.01) {
      errors.price = ['Price must be a valid number greater than or equal to $0.01']
    } else {
      validatedData.price = priceResult.value
    }
  }

  // Validate salePrice (optional)
  if (data.salePrice !== undefined && data.salePrice !== '') {
    const saleResult = parseNumber(data.salePrice)
    if (!saleResult.success || saleResult.value === undefined || saleResult.value < 0.01) {
      errors.salePrice = ['Sale price must be a valid number greater than or equal to $0.01']
    } else {
      validatedData.salePrice = saleResult.value
    }
  } else if (data.salePrice === '') {
    validatedData.salePrice = undefined
  }

  // Validate commissionRate
  if (!isUpdate || data.commissionRate !== undefined) {
    const commResult = parseNumber(data.commissionRate)
    if (!commResult.success || commResult.value === undefined) {
      errors.commissionRate = ['Commission rate must be a valid number']
    } else if (commResult.value < 0) {
      errors.commissionRate = ['Commission rate must be at least 0%']
    } else if (commResult.value > 100) {
      errors.commissionRate = ['Commission rate must not exceed 100%']
    } else {
      validatedData.commissionRate = commResult.value
    }
  }

  // Validate imageUrl (optional)
  if (data.imageUrl !== undefined && data.imageUrl !== '') {
    if (typeof data.imageUrl !== 'string') {
      errors.imageUrl = ['Image URL must be a string']
    } else {
      try {
        new URL(data.imageUrl)
        validatedData.imageUrl = data.imageUrl
      } catch {
        errors.imageUrl = ['Image URL must be a valid URL']
      }
    }
  }

  // Validate recurringBilling
  if (data.recurringBilling !== undefined) {
    if (typeof data.recurringBilling === 'boolean') {
      validatedData.recurringBilling = data.recurringBilling
    } else if (data.recurringBilling === 'false') {
      validatedData.recurringBilling = false
    } else if (data.recurringBilling === 'true') {
      validatedData.recurringBilling = true
    }
  }

  // Validate billingCycle (optional, but dependent on recurringBilling)
  if (data.billingCycle !== undefined && data.billingCycle !== '') {
    if (!isBillingCycle(data.billingCycle)) {
      errors.billingCycle = ['Invalid billing cycle selected']
    } else {
      validatedData.billingCycle = data.billingCycle
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
export function getFieldError(errors: ValidationError | null | undefined, fieldName: string): string | undefined {
  return errors?.[fieldName]?.[0]
}

/**
 * Check if a field has errors
 */
export function hasFieldError(errors: ValidationError | null | undefined, fieldName: string): boolean {
  return Boolean(errors?.[fieldName]?.length)
}

/**
 * Get all errors for a field as a comma-separated string
 */
export function getFieldErrorMessage(errors: ValidationError | null | undefined, fieldName: string): string {
  return errors?.[fieldName]?.join(', ') || ''
}

/** Returns the errors without one field, or null when none are left. */
export function withoutField(errors: ValidationError | null | undefined, fieldName: string): ValidationError | null {
  if (!errors) return null
  const rest = Object.fromEntries(Object.entries(errors).filter(([key]) => key !== fieldName))
  return Object.keys(rest).length > 0 ? rest : null
}
