import vine from '@vinejs/vine'

export const createCampaignValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    slug: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().minLength(10).optional(),
    termsAndConditions: vine.string().trim().optional(),
    promotionGuidelines: vine.string().trim().optional(),

    // Commission configuration
    commissionType: vine
      .enum(['percentage', 'fixed_amount', 'lead_commission', 'cost_per_acquisition', 'tiered', 'hybrid'])
      .optional(),
    commissionValue: vine.number().min(0).max(10000).optional(),
    fixedFee: vine.number().min(0).optional(),
    tieredCommissionStructure: vine.any().optional(),

    // Campaign dates
    startDate: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }).optional(),
    endDate: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }).optional(),

    // Attribution
    attributionWindowDays: vine.number().min(1).max(365).optional(),

    // Category
    category: vine.enum([
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
    ]),

    // Images and assets
    featuredImageUrl: vine.string().url().optional(),
    galleryUrls: vine.array(vine.string().url()).optional(),

    // Tags and resources
    tags: vine.array(vine.string()).optional(),
    affiliateResources: vine.any().optional(),
  })
)

export const updateCampaignValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    slug: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().minLength(10).optional(),
    termsAndConditions: vine.string().trim().optional(),
    promotionGuidelines: vine.string().trim().optional(),

    // Commission configuration
    commissionType: vine
      .enum(['percentage', 'fixed_amount', 'lead_commission', 'cost_per_acquisition', 'tiered', 'hybrid'])
      .optional(),
    commissionValue: vine.number().min(0).max(10000).optional(),
    fixedFee: vine.number().min(0).optional(),
    tieredCommissionStructure: vine.any().optional(),

    // Campaign dates
    startDate: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }).optional(),
    endDate: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }).optional(),

    // Attribution
    attributionWindowDays: vine.number().min(1).max(365).optional(),

    // Category
    category: vine
      .enum([
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
      ])
      .optional(),

    // Images and assets
    featuredImageUrl: vine.string().url().optional(),
    galleryUrls: vine.array(vine.string().url()).optional(),

    // Tags and resources
    tags: vine.array(vine.string()).optional(),
    affiliateResources: vine.any().optional(),
  })
)
