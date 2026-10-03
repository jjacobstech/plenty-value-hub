import React from 'react'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, ExternalLink, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface IntegrationStatus {
  name: string
  slug: string
  description: string
  icon: React.ComponentType
  status: 'connected' | 'available' | 'coming_soon'
  features: string[]
  actionUrl?: string
  actionLabel?: string
}

const ShopifyLogo = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2C3.239 2 1 4.239 1 7v10c0 2.761 2.239 5 5 5h12c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H6zm8 2c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm-4 8h8v6H10v-6z" fill="#96bf48"/>
  </svg>
)

const WooCommerceLogo = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm8 2h4v8H11V8z" fill="#7cb305"/>
  </svg>
)

const AmazonLogo = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 12c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm8-6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="#FF9900"/>
  </svg>
)

const EtsyLogo = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" fill="#F1641E"/>
  </svg>
)

const integrations: IntegrationStatus[] = [
  {
    name: 'Shopify',
    slug: 'shopify',
    description: 'Connect your Shopify store to sync products, orders, and automatically calculate commissions for your affiliates.',
    icon: ShopifyLogo,
    status: 'available',
    features: [
      'Product catalog sync',
      'Real-time order tracking',
      'Automatic commission calculation',
      'Inventory management',
      'Analytics dashboard'
    ],
    actionUrl: 'javascript:void(0)',
    actionLabel: 'Connect Store'
  },
  {
    name: 'WooCommerce',
    slug: 'woocommerce',
    description: 'Integrate your WooCommerce store with automatic product and order synchronization.',
    icon: WooCommerceLogo,
    status: 'available',
    features: [
      'Product sync',
      'Order management',
      'Commission tracking',
      'Store analytics',
      'Custom pricing'
    ],
    actionUrl: 'javascript:void(0)',
    actionLabel: 'Connect Store'
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    description: 'Manage your Amazon affiliate partnerships directly from your dashboard.',
    icon: AmazonLogo,
    status: 'available',
    features: [
      'Product linking',
      'Commission tracking',
      'Performance analytics'
    ]
  },
  {
    name: 'Etsy',
    slug: 'etsy',
    description: 'Connect your Etsy shop to the affiliate network.',
    icon: EtsyLogo,
    status: 'available',
    features: [
      'Shop sync',
      'Order tracking',
      'Affiliate management'
    ]
  }
]

export default function VendorIntegrations({ user }: { user: any }) {
  const [shopDomain, setShopDomain] = React.useState('')
  const [storeUrl, setStoreUrl] = React.useState('')
  const [showShopifyPrompt, setShowShopifyPrompt] = React.useState(false)
  const [showWooCommercePrompt, setShowWooCommercePrompt] = React.useState(false)

  const handleConnect = (integration: IntegrationStatus) => {
    if (integration.slug === 'shopify') {
      setShowShopifyPrompt(true)
    } else if (integration.slug === 'woocommerce') {
      setShowWooCommercePrompt(true)
    } else if (integration.slug === 'amazon') {
      window.location.href = '/api/amazon/auth-url'
    } else if (integration.slug === 'etsy') {
      window.location.href = '/api/etsy/auth-url'
    }
  }

  const handleShopifyConnect = () => {
    if (!shopDomain.trim()) {
      alert('Please enter your Shopify store domain (e.g., mystore.myshopify.com)')
      return
    }
    window.location.href = `/api/shopify/auth-url?shop_domain=${encodeURIComponent(shopDomain)}`
  }

  const handleWooCommerceConnect = () => {
    if (!storeUrl.trim()) {
      alert('Please enter your WooCommerce store URL (e.g., https://mystore.com)')
      return
    }
    // Store URL and consumer key/secret would be collected here in a real implementation
    window.location.href = `/api/woocommerce/connect?store_url=${encodeURIComponent(storeUrl)}`
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Integrations" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Integrations</h1>
          <p className="text-gray-500 mt-2">Connect your e-commerce store to automate product syncing and commission management</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connecting an integration allows automatic synchronization of your products, orders, and customer data with our platform.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.slug} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2">
                      <integration.icon />
                    </div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription className="mt-2">{integration.description}</CardDescription>
                  </div>
                  {integration.status === 'connected' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    {integration.status === 'available' && (
                      <Button
                        className="w-full"
                        onClick={() => handleConnect(integration)}
                      >
                        {integration.actionLabel}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {integration.status === 'connected' && (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Connected
                      </Button>
                    )}
                    {integration.status === 'coming_soon' && (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">API Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>You can also use our REST API to integrate your store programmatically:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><code className="bg-white px-2 py-1 rounded text-xs">GET /api/shopify/auth-url</code> - Initiate Shopify OAuth flow</li>
              <li><code className="bg-white px-2 py-1 rounded text-xs">POST /api/woocommerce/connect</code> - Connect WooCommerce</li>
              <li><code className="bg-white px-2 py-1 rounded text-xs">GET /api/shopify/products</code> - List products</li>
              <li><code className="bg-white px-2 py-1 rounded text-xs">GET /api/woocommerce/orders</code> - List orders</li>
            </ul>
            <p className="text-gray-600 mt-3">See our <a href="#" className="text-blue-600 hover:underline">API documentation</a> for complete details.</p>
          </CardContent>
        </Card>

        {/* Shopify Domain Prompt Modal */}
        {showShopifyPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Connect Your Shopify Store</CardTitle>
                <button
                  onClick={() => setShowShopifyPrompt(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Shopify Store Domain</label>
                  <input
                    type="text"
                    placeholder="mystore.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleShopifyConnect()}
                  />
                  <p className="text-xs text-gray-500 mt-2">Example: mystore.myshopify.com (without https://)</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowShopifyPrompt(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShopifyConnect}
                  >
                    Connect Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* WooCommerce Setup Prompt Modal */}
        {showWooCommercePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Connect Your WooCommerce Store</CardTitle>
                <button
                  onClick={() => setShowWooCommercePrompt(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Store URL</label>
                  <input
                    type="url"
                    placeholder="https://mystore.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleWooCommerceConnect()}
                  />
                  <p className="text-xs text-gray-500 mt-2">Example: https://mystore.com</p>
                </div>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <p className="text-blue-900 mb-2"><strong>Next Steps:</strong></p>
                  <ol className="text-blue-800 space-y-1 text-xs list-decimal list-inside">
                    <li>Generate WooCommerce REST API credentials in your store settings</li>
                    <li>Provide Consumer Key and Consumer Secret</li>
                    <li>Complete the connection</li>
                  </ol>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowWooCommercePrompt(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWooCommerceConnect}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
