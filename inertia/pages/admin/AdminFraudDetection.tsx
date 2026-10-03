import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function AdminFraudDetection({ user }: { user: any }) {
  const mockFraudCases = [
    {
      id: 1,
      type: 'Duplicate Orders',
      riskLevel: 'high',
      affiliateId: 12,
      affiliateName: 'Suspicious User',
      conversionsCount: 15,
      orderValue: 2500,
      flaggedAt: '2025-10-02',
      status: 'pending'
    },
    {
      id: 2,
      type: 'Velocity Anomaly',
      riskLevel: 'critical',
      affiliateId: 28,
      affiliateName: 'Bot Network',
      conversionsCount: 450,
      orderValue: 15000,
      flaggedAt: '2025-10-01',
      status: 'reviewing'
    },
    {
      id: 3,
      type: 'Device Suspicion',
      riskLevel: 'medium',
      affiliateId: 5,
      affiliateName: 'John Affiliate',
      conversionsCount: 8,
      orderValue: 800,
      flaggedAt: '2025-09-30',
      status: 'approved'
    }
  ]

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <DashboardLayout user={user}>
      <Head title="Fraud Detection" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fraud Detection</h1>
          <p className="text-gray-500 mt-2">Monitor and manage suspicious affiliate activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-red-600 mt-1">Immediate action needed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-orange-600 mt-1">Review required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-yellow-600 mt-1">Pending decision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Fraud Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$18.3K</div>
              <p className="text-xs text-gray-500 mt-1">At risk</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Flagged Conversions</CardTitle>
            <CardDescription>Suspicious activity detected by automated fraud detection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-3 font-medium">Flag Type</th>
                    <th className="text-left py-3 px-3 font-medium">Affiliate</th>
                    <th className="text-left py-3 px-3 font-medium">Conversions</th>
                    <th className="text-left py-3 px-3 font-medium">Value</th>
                    <th className="text-left py-3 px-3 font-medium">Risk Level</th>
                    <th className="text-left py-3 px-3 font-medium">Status</th>
                    <th className="text-left py-3 px-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFraudCases.map((case_) => (
                    <tr key={case_.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{case_.type}</td>
                      <td className="py-3 px-3">{case_.affiliateName}</td>
                      <td className="py-3 px-3 text-center font-semibold">{case_.conversionsCount}</td>
                      <td className="py-3 px-3 font-semibold">${case_.orderValue.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <Badge className={getRiskColor(case_.riskLevel)}>
                          {case_.riskLevel.charAt(0).toUpperCase() + case_.riskLevel.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(case_.status)}
                          <span className="capitalize text-xs">{case_.status}</span>
                        </div>
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
