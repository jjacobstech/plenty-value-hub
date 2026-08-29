import DashboardLayout from '@/components/layout/DashboardLayout'
import React from 'react'
import StatsCard from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Package, ShoppingCart, TrendingUp, Mail } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatUSD as formatNGN, getActiveCurrency } from '@/lib/currency'

type Order = {
  id: number
  status: string
  amount: string
  platformFee?: string
  commissionAmount?: string
  productId?: number
  productName?: string
  buyerId?: number
  vendorId?: number
  affiliateId?: number
  createdAt: any
}

type Product = {
  id: number
  name: string
  status: string
  category?: string
  price?: string
  commissionRate?: string
  totalSales?: number
  totalRevenue?: string
  createdAt: any
}

type User = {
  id: number
  role?: string
  email?: string
  fullName?: string
}

type AdminDashboardProps = {
  products: Product[]
  orders: Order[]
  users: User[]
  subscriberCount?: number
}

export default function AdminDashboard({
  products = [],
  orders = [],
  users = [],
  subscriberCount = 0,
}: AdminDashboardProps) {
  // Safely calculate metrics with error handling
  const safeParseFloat = (value: any) => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  const completedOrders = orders.filter((o) => o?.status === 'completed') || []
  
  const totalGMV = completedOrders.reduce((sum, o) => {
    return sum + safeParseFloat(o?.amount)
  }, 0)

  const platformRevenue = completedOrders.reduce((sum, o) => {
    return sum + safeParseFloat(o?.platformFee)
  }, 0)

  const pendingProducts = products.filter((p) => p?.status === 'pending')?.length || 0
  const affiliates = users.filter((u) => u?.role === 'affiliate')?.length || 0
  const vendors = users.filter((u) => u?.role === 'vendor')?.length || 0

  // Safe category data calculation
  const categoryData = {}
  completedOrders.forEach((o) => {
    if (!o) return
    
    const product = products.find((p) => p?.id === o.productId)
    const cat = product?.category || 'other'
    const amount = safeParseFloat(o.amount)
    
    categoryData[cat] = (categoryData[cat] || 0) + amount
  })

  const chartData = Object.entries(categoryData).map(([name, revenue]) => ({
    name: name.replace(/_/g, ' ').substring(0, 12),
    revenue,
  }))

  const curr = getActiveCurrency()

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Marketplace overview and key metrics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title={`GMV (${curr})`} value={formatNGN(totalGMV)} icon={DollarSign} />
          <StatsCard
            title={`Platform Revenue (${curr})`}
            value={formatNGN(platformRevenue)}
            icon={TrendingUp}
          />
          <StatsCard title="Total Orders" value={orders.length} icon={ShoppingCart} />
          <StatsCard
            title="Active Products"
            value={products.filter((p) => p.status === 'approved').length}
            icon={Package}
          />
          <StatsCard title="Pending Approval" value={pendingProducts} icon={Package} />
          <StatsCard title="Newsletter Subs" value={subscriberCount} icon={Mail} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Consumers</span>
                  <span className="font-bold">
                    {users.filter((u) => u.role === 'consumer' || !u.role).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Affiliates</span>
                  <span className="font-bold">{affiliates}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vendors</span>
                  <span className="font-bold">{vendors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Admins</span>
                  <span className="font-bold">
                    {users.filter((u) => u.role === 'admin').length}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Total Users</span>
                  <span className="font-bold">{users.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip formatter={(v) => formatNGN(v)} />
                      <Bar dataKey="revenue" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
