import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function AdminDisputes({ user }: { user: any }) {
  const mockDisputes = [
    {
      id: 1,
      type: 'Commission Dispute',
      status: 'open',
      priority: 'high',
      affiliateId: 5,
      affiliateName: 'John Affiliate',
      amount: 250.00,
      reason: 'Commission not credited for order #12345',
      createdAt: '2025-10-02',
      daysOpen: 1
    },
    {
      id: 2,
      type: 'Order Chargeback',
      status: 'escalated',
      priority: 'critical',
      vendorId: 3,
      vendorName: 'TechStore',
      amount: 1500.00,
      reason: 'Customer initiated chargeback',
      createdAt: '2025-09-28',
      daysOpen: 5
    },
    {
      id: 3,
      type: 'Conversion Dispute',
      status: 'resolved',
      priority: 'low',
      affiliateId: 8,
      affiliateName: 'Sarah Partner',
      amount: 75.00,
      reason: 'Conversion status mismatch',
      createdAt: '2025-09-20',
      daysOpen: 13
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <DashboardLayout role="admin">
      <Head title="Disputes Management" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disputes Management</h1>
          <p className="text-gray-500 mt-2">Review and resolve disputes between vendors and affiliates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting resolution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-gray-500 mt-1">Requires immediate action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,250</div>
              <p className="text-xs text-gray-500 mt-1">At dispute</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Disputes</CardTitle>
            <CardDescription>Review and manage all open disputes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-3 font-medium">Type</th>
                    <th className="text-left py-3 px-3 font-medium">Involved Party</th>
                    <th className="text-left py-3 px-3 font-medium">Amount</th>
                    <th className="text-left py-3 px-3 font-medium">Reason</th>
                    <th className="text-left py-3 px-3 font-medium">Status</th>
                    <th className="text-left py-3 px-3 font-medium">Days Open</th>
                    <th className="text-left py-3 px-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDisputes.map((dispute) => (
                    <tr key={dispute.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{dispute.type}</td>
                      <td className="py-3 px-3">
                        {dispute.affiliateName || dispute.vendorName}
                      </td>
                      <td className="py-3 px-3 font-semibold">${dispute.amount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-gray-600 max-w-xs truncate">{dispute.reason}</td>
                      <td className="py-3 px-3">
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className={getPriorityColor(dispute.priority)}>
                          {dispute.daysOpen}d
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
