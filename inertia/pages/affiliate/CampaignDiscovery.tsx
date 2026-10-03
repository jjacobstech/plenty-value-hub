import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, TrendingUp, Calendar, DollarSign, Target, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { formatUSD as formatNGN } from '@/lib/currency'
import { toast } from 'sonner'
import api from '@/api/http-client'

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Health & Fitness', value: 'health_fitness' },
  { label: 'Business', value: 'business_investing' },
  { label: 'Software', value: 'software_saas' },
  { label: 'Education', value: 'education' },
  { label: 'Technology', value: 'technology' },
  { label: 'AI Tools', value: 'ai_tools' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Finance', value: 'finance' },
  { label: 'E-Commerce', value: 'ecommerce' },
]

const COMMISSION_RANGES = [
  { label: 'All Commissions', value: '' },
  { label: '5% - 10%', value: '5-10' },
  { label: '10% - 20%', value: '10-20' },
  { label: '20% - 50%', value: '20-50' },
  { label: '50%+', value: '50-100' },
]

type Campaign = {
  id: string
  name: string
  productServiceName: string
  description: string
  imageUrl?: string
  category: string
  commissionType: 'percentage' | 'fixed_amount' | 'lead' | 'hybrid'
  commissionAmount: number
  purchaseDestination: string
  attributionWindowDays: number
  campaignTerms?: string
  promotionalGuidelines?: string
  startDate: string
  endDate: string
  targetAudience?: string
  status: string
  createdAt: string
  vendor?: {
    id: string
    name: string
  }
  stats?: {
    clicks: number
    conversions: number
    conversionRate: number
    earnings: number
  }
}

type CampaignDiscoveryProps = {
  user: any
  initialCampaigns?: Campaign[]
}

export default function CampaignDiscovery({ user, initialCampaigns = [] }: CampaignDiscoveryProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCommissionRange, setSelectedCommissionRange] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCampaigns, setTotalCampaigns] = useState(0)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinedCampaigns, setJoinedCampaigns] = useState<Set<string>>(new Set())

  const limit = 12

  const fetchCampaigns = async (page: number, search = '', category = '', commissionRange = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { searchTerm: search }),
        ...(category && { category }),
      })

      if (commissionRange) {
        const [min, max] = commissionRange.split('-').map(Number)
        if (min) params.append('minCommission', String(min))
        if (max && max < 100) params.append('maxCommission', String(max))
      }

      const response = await api.get(`/campaigns?${params}`)
      if (response.data?.success) {
        setCampaigns(response.data.data.campaigns || [])
        setTotalPages(response.data.data.lastPage || 1)
        setTotalCampaigns(response.data.data.total || 0)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns(1, searchTerm, selectedCategory, selectedCommissionRange)
  }, [selectedCategory, selectedCommissionRange])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    fetchCampaigns(1, value, selectedCategory, selectedCommissionRange)
  }

  const handleJoinCampaign = async () => {
    if (!selectedCampaign) return

    setJoiningId(selectedCampaign.id)
    try {
      const response = await api.post(`/campaigns/${selectedCampaign.id}/join`, {})
      if (response.data?.success) {
        toast.success('Successfully joined campaign!')
        setJoinedCampaigns(prev => new Set(prev).add(selectedCampaign.id))
        setShowJoinDialog(false)
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to join campaign'
      toast.error(message)
    } finally {
      setJoiningId(null)
    }
  }

  const getCommissionLabel = (type: string, amount: number) => {
    switch (type) {
      case 'percentage':
        return `${amount}%`
      case 'fixed_amount':
        return formatNGN(amount)
      case 'lead':
        return `${formatNGN(amount)} per lead`
      case 'hybrid':
        return `${amount}% + bonus`
      default:
        return `${amount}`
    }
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const daysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const paginationItems = useMemo(() => {
    const items = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      items.push(1)
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4)
      }
      if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3)
      }

      if (startPage > 2) items.push('...')
      for (let i = startPage; i <= endPage; i++) {
        items.push(i)
      }
      if (endPage < totalPages - 1) items.push('...')
      items.push(totalPages)
    }

    return items
  }, [currentPage, totalPages])

  return (
    <DashboardLayout user={user} title="Campaign Discovery">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Campaigns</h1>
          <p className="text-gray-600 mt-2">
            Browse and join affiliate campaigns to start earning commissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCampaigns}</div>
              <p className="text-xs text-gray-500 mt-1">Available to join</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Your Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{joinedCampaigns.size}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15-25%</div>
              <p className="text-xs text-gray-500 mt-1">Across all campaigns</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Commission Range */}
              <Select value={selectedCommissionRange} onValueChange={setSelectedCommissionRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select commission" />
                </SelectTrigger>
                <SelectContent>
                  {COMMISSION_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setSelectedCommissionRange('')
                  setCurrentPage(1)
                  fetchCampaigns(1, '', '', '')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                  const expired = isExpired(campaign.endDate)
                  const days = daysRemaining(campaign.endDate)
                  const isJoined = joinedCampaigns.has(campaign.id)

                  return (
                    <Card
                      key={campaign.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Campaign Image */}
                      {campaign.imageUrl && (
                        <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                          <img
                            src={campaign.imageUrl}
                            alt={campaign.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base line-clamp-1">
                              {campaign.name}
                            </CardTitle>
                            {campaign.vendor && (
                              <CardDescription className="text-xs mt-1">
                                by {campaign.vendor.name}
                              </CardDescription>
                            )}
                          </div>
                          {isJoined && (
                            <Badge variant="default" className="flex-shrink-0 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Joined
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pb-4">
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2">
                          {campaign.category && (
                            <Badge variant="secondary" className="text-xs">
                              {campaign.category.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                          )}
                          {expired ? (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          ) : days <= 7 ? (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {days} days left
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {days} days left
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {campaign.description}
                        </p>

                        {/* Commission */}
                        <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-lg">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Commission</p>
                            <p className="text-sm font-semibold text-blue-600">
                              {getCommissionLabel(campaign.commissionType, campaign.commissionAmount)}
                            </p>
                          </div>
                        </div>

                        {/* Attribution Window */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{campaign.attributionWindowDays}-day attribution window</span>
                        </div>

                        {/* Stats if available */}
                        {campaign.stats && (
                          <div className="grid grid-cols-3 gap-2 text-xs text-center">
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-gray-600">Clicks</p>
                              <p className="font-semibold">{campaign.stats.clicks}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-gray-600">Conversions</p>
                              <p className="font-semibold">{campaign.stats.conversions}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-gray-600">Rate</p>
                              <p className="font-semibold">
                                {(campaign.stats.conversionRate * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <Button
                          className="w-full"
                          disabled={expired || isJoined}
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setShowJoinDialog(true)
                          }}
                        >
                          {isJoined ? 'Already Joined' : 'Join Campaign'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => {
                              fetchCampaigns(
                                currentPage - 1,
                                searchTerm,
                                selectedCategory,
                                selectedCommissionRange
                              )
                            }}
                          />
                        </PaginationItem>
                      )}

                      {paginationItems.map((item, index) => (
                        <PaginationItem key={index}>
                          {item === '...' ? (
                            <span className="px-2 text-gray-500">...</span>
                          ) : (
                            <PaginationLink
                              onClick={() => {
                                if (typeof item === 'number') {
                                  fetchCampaigns(
                                    item,
                                    searchTerm,
                                    selectedCategory,
                                    selectedCommissionRange
                                  )
                                }
                              }}
                              isActive={currentPage === item}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              fetchCampaigns(
                                currentPage + 1,
                                searchTerm,
                                selectedCategory,
                                selectedCommissionRange
                              )
                            }}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No campaigns found matching your filters</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                    setSelectedCommissionRange('')
                    fetchCampaigns(1, '', '', '')
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Join Campaign Dialog */}
        <AlertDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Join Campaign?</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedCampaign && (
                  <div className="space-y-2 py-4">
                    <p className="font-semibold text-gray-900">{selectedCampaign.name}</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedCampaign.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-600">Commission</p>
                        <p className="font-semibold text-sm">
                          {getCommissionLabel(
                            selectedCampaign.commissionType,
                            selectedCampaign.commissionAmount
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Attribution Window</p>
                        <p className="font-semibold text-sm">
                          {selectedCampaign.attributionWindowDays} days
                        </p>
                      </div>
                    </div>
                    {selectedCampaign.campaignTerms && (
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-700">
                        <strong>Terms:</strong> {selectedCampaign.campaignTerms}
                      </div>
                    )}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleJoinCampaign}
                disabled={joiningId === selectedCampaign?.id}
              >
                {joiningId === selectedCampaign?.id ? 'Joining...' : 'Join Campaign'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
