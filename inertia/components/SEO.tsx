import { Head } from '@inertiajs/react'

const SITE_NAME = 'Plenty Value'
const DEFAULT_DESCRIPTION =
  'Discover top digital products, join as a vendor to sell, or become an affiliate to earn commissions on Plenty Value.'
const DEFAULT_IMAGE = '/og-image.png'

interface SEOProps {
  title: string
  description?: string
  image?: string
  type?: 'website' | 'product' | 'article'
  noIndex?: boolean
  structuredData?: Record<string, unknown>
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  structuredData,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const metaDescription = truncate(description, 160)
  const canonicalUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Head>
  )
}
