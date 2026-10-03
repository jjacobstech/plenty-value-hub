import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface IntegrationStatus {
  name: string
  slug: string
  description: string
  icon: string
  status: 'connected' | 'available' | 'coming_soon'
  features: string[]
  actionUrl?: string
  actionLabel?: string
}

const integrations: IntegrationStatus[] = [
  {
    name: 'Shopify',
    slug: 'shopify',
    description: 'Connect your Shopify store to sync products, orders, and automatically calculate commissions for your affiliates.',
    icon: '🛍️',
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
    icon: '📦',
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
    icon: '🚀',
    status: 'coming_soon',
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
    icon: '🎨',
    status: 'coming_soon',
    features: [
      'Shop sync',
      'Order tracking',
      'Affiliate management'
    ]
  }
]

export default function VendorIntegrations({ user }: { user: any }) {
  const handleConnect = (integration: IntegrationStatus) => {
    if (integration.slug === 'shopify') {
      // Initiate Shopify OAuth flow
      window.location.href = '/api/shopify/auth-url'
    } else if (integration.slug === 'woocommerce') {
      // Open WooCommerce connection modal or page
      alert('WooCommerce connection setup coming soon. Use the API endpoints for now.')
    }
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
                    <div className="text-3xl mb-2">{integration.icon}</div>
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
              <li><code className="bg-white px-2 py-1 rounded text-xs">POST /api/shopify/auth-url</code> - Get Shopify OAuth link</li>
              <li><code className="bg-white px-2 py-1 rounded text-xs">POST /api/woocommerce/connect</code> - Connect WooCommerce</li>
              <li><code className="bg-white px-2 py-1 rounded text-xs">GET /api/shopify/products</code> - List products</li>
              <li><code className="bg-white px-2 py-1 rounded text-xs">GET /api/woocommerce/orders</code> - List orders</li>
            </ul>
            <p className="text-gray-600 mt-3">See our <a href="#" className="text-blue-600 hover:underline">API documentation</a> for complete details.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
