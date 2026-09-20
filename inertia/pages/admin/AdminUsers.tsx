import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle, UserX, UserCheck, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/api/http-client'

type AdminUsersProps = {
  users: any[]
}

// ─── User Detail Sheet ────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium break-all">{value}</span>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mt-4 mb-1">
      {children}
    </p>
  )
}

function UserDetailSheet({
  user,
  open,
  onClose,
}: {
  user: any | null
  open: boolean
  onClose: () => void
}) {
  if (!user) return null

  const isInactive = user.status === 'inactive'
  const roleColors: Record<string, string> = {
    admin: 'destructive',
    vendor: 'default',
    affiliate: 'secondary',
    consumer: 'outline',
  }

  const fmtDate = (val: string | null | undefined) =>
    val ? format(new Date(val), 'MMM d, yyyy HH:mm') : null

  // Derive initials from name or email
  const initials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase()

  // Check if vendor or affiliate role has any non-null profile data to show
  const hasBusinessData =
    user.businessName || user.businessType || user.businessDescription ||
    user.productCategories || user.businessLogo || user.coverBanner

  const hasAffiliateData = user.niche || user.marketingChannels

  const hasPayoutData =
    user.payoutMethod || user.payoutBankName || user.payoutAccountNumber ||
    user.payoutAccountName || user.payoutEmail || user.payoutMobileNumber ||
    user.payoutAccountId || user.payoutMetadata

  const hasPaystackData =
    user.paystackRecipientCode || user.paystackBankCode ||
    user.paystackRecipientVerified === true

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName || user.email}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold leading-tight">
                {user.fullName || '(no name)'}
              </p>
              <p className="text-xs text-muted-foreground break-all">{user.email}</p>
            </div>

            <div className="flex flex-col gap-1 items-end shrink-0">
              <Badge
                variant={(roleColors[user.role] as any) ?? 'outline'}
                className="text-xs capitalize"
              >
                {user.role || 'consumer'}
              </Badge>
              {isInactive ? (
                <Badge variant="outline" className="text-xs text-red-600 border-red-300 bg-red-50">
                  Inactive
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0">

          {/* Account */}
          <SectionHeading>Account</SectionHeading>
          <div className="h-px w-full bg-border mb-2" />
          <DetailRow label="ID" value={user.id} />
          <DetailRow label="UUID" value={<span className="font-mono text-[11px]">{user.uuid}</span>} />
          <DetailRow
            label="Email verified"
            value={
              user.emailVerifiedAt ? (
                <span className="text-green-600">✓ {fmtDate(user.emailVerifiedAt)}</span>
              ) : (
                <span className="text-muted-foreground">Not verified</span>
              )
            }
          />
          <DetailRow label="Joined" value={fmtDate(user.createdAt)} />
          <DetailRow label="Last updated" value={fmtDate(user.updatedAt)} />

          {/* Profile — only show section if any field is non-null */}
          {(user.phone || user.country || user.location || user.bio ||
            user.website || user.instagram || user.twitter || user.youtube ||
            user.heardAbout) && (
            <>
              <SectionHeading>Profile</SectionHeading>
              <div className="h-px w-full bg-border mb-2" />
              <DetailRow label="Phone" value={user.phone} />
              <DetailRow label="Country" value={user.country} />
              <DetailRow label="Location" value={user.location} />
              <DetailRow label="Bio" value={user.bio} />
              <DetailRow label="Website" value={user.website} />
              <DetailRow label="Instagram" value={user.instagram} />
              <DetailRow label="Twitter" value={user.twitter} />
              <DetailRow label="YouTube" value={user.youtube} />
              <DetailRow label="Heard about us" value={user.heardAbout} />
            </>
          )}

          {/* Business */}
          {hasBusinessData && (
            <>
              <SectionHeading>Business</SectionHeading>
              <div className="h-px w-full bg-border mb-2" />
              <DetailRow label="Business name" value={user.businessName} />
              <DetailRow label="Business type" value={user.businessType} />
              <DetailRow label="Description" value={user.businessDescription} />
              <DetailRow label="Product categories" value={user.productCategories} />
              {user.businessLogo && (
                <div className="grid grid-cols-2 gap-2 py-1.5">
                  <span className="text-xs text-muted-foreground">Business logo</span>
                  <img
                    src={user.businessLogo}
                    alt="Business logo"
                    className="h-10 w-10 rounded object-cover"
                  />
                </div>
              )}
              {user.coverBanner && (
                <div className="grid grid-cols-2 gap-2 py-1.5">
                  <span className="text-xs text-muted-foreground">Cover banner</span>
                  <img
                    src={user.coverBanner}
                    alt="Cover banner"
                    className="h-10 w-24 rounded object-cover"
                  />
                </div>
              )}
            </>
          )}

          {/* Affiliate */}
          {hasAffiliateData && (
            <>
              <SectionHeading>Affiliate Info</SectionHeading>
              <div className="h-px w-full bg-border mb-2" />
              <DetailRow label="Niche" value={user.niche} />
              <DetailRow label="Marketing channels" value={user.marketingChannels} />
            </>
          )}

          {/* Payout Configuration */}
          {hasPayoutData && (
            <>
              <SectionHeading>Payout Configuration</SectionHeading>
              <div className="h-px w-full bg-border mb-2" />
              <DetailRow label="Method" value={user.payoutMethod} />
              <DetailRow label="Bank name" value={user.payoutBankName} />
              <DetailRow label="Account number" value={user.payoutAccountNumber} />
              <DetailRow label="Account name" value={user.payoutAccountName} />
              <DetailRow label="Routing number" value={user.payoutRoutingNumber} />
              <DetailRow label="SWIFT code" value={user.payoutSwiftCode} />
              <DetailRow label="Mobile provider" value={user.payoutMobileProvider} />
              <DetailRow label="Mobile number" value={user.payoutMobileNumber} />
              <DetailRow label="Payout email" value={user.payoutEmail} />
              <DetailRow label="Account ID" value={user.payoutAccountId} />
              <DetailRow label="Payout details" value={user.payoutDetails} />
              {user.payoutMetadata && (
                <DetailRow
                  label="Metadata"
                  value={
                    <span className="font-mono text-[11px] break-all">
                      {typeof user.payoutMetadata === 'string'
                        ? user.payoutMetadata
                        : JSON.stringify(user.payoutMetadata)}
                    </span>
                  }
                />
              )}
            </>
          )}

          {/* Paystack Transfer */}
          {hasPaystackData && (
            <>
              <SectionHeading>Paystack Transfer</SectionHeading>
              <div className="h-px w-full bg-border mb-2" />
              <DetailRow label="Recipient code" value={user.paystackRecipientCode} />
              <DetailRow label="Bank code" value={user.paystackBankCode} />
              <DetailRow label="Bank name" value={user.paystackBankName} />
              <DetailRow
                label="Recipient verified"
                value={
                  user.paystackRecipientVerified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-muted-foreground">Not verified</span>
                  )
                }
              />
              <DetailRow label="Last transfer ref" value={user.lastTransferReference} />
              <DetailRow label="Last transfer at" value={fmtDate(user.lastTransferAt)} />
            </>
          )}

          {/* Empty state — user has barely any data filled in */}
          {!user.phone && !user.country && !hasBusinessData && !hasAffiliateData &&
            !hasPayoutData && !hasPaystackData && (
            <p className="text-xs text-muted-foreground mt-4">
              This user has not filled in any additional profile details yet.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminUsers(props: AdminUsersProps) {
  const [users, setUsers] = useState(props.users)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionTarget, setActionTarget] = useState<any | null>(null)
  const [actionType, setActionType] = useState<'deactivate' | 'reactivate' | null>(null)
  const [processing, setProcessing] = useState(false)
  const [viewUser, setViewUser] = useState<any | null>(null)

  const updateRole = async (id: number, role: string) => {
    try {
      await api.put(`/api/users/${id}`, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
      toast.success('User role updated')
    } catch {
      toast.error('Failed to update user role')
    }
  }

  const confirmAction = async () => {
    if (!actionTarget || !actionType) return
    setProcessing(true)
    try {
      if (actionType === 'deactivate') {
        await api.delete(`/api/users/${actionTarget.id}`)
        setUsers((prev) =>
          prev.map((u) => (u.id === actionTarget.id ? { ...u, status: 'inactive' } : u))
        )
        toast.success(`"${actionTarget.fullName || actionTarget.email}" has been deactivated`)
      } else {
        // Reactivate via role update endpoint — we update status via a dedicated call
        await api.put(`/api/users/${actionTarget.id}`, { status: 'active' })
        setUsers((prev) =>
          prev.map((u) => (u.id === actionTarget.id ? { ...u, status: 'active' } : u))
        )
        toast.success(`"${actionTarget.fullName || actionTarget.email}" has been reactivated`)
      }
      setActionTarget(null)
      setActionType(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Action failed')
    } finally {
      setProcessing(false)
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.status !== 'inactive') ||
      (statusFilter === 'inactive' && u.status === 'inactive')
    return matchSearch && matchRole && matchStatus
  })

  const roleColors: Record<string, string> = {
    admin: 'destructive',
    vendor: 'default',
    affiliate: 'secondary',
    consumer: 'outline',
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage platform users, roles, and account status</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="affiliate">Affiliate</SelectItem>
              <SelectItem value="consumer">Consumer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => {
                  const isInactive = user.status === 'inactive'
                  return (
                    <TableRow key={user.id} className={isInactive ? 'opacity-60' : ''}>
                      <TableCell className="font-medium">{user.fullName || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={(roleColors[user.role] as any) ?? 'outline'}
                          className="text-xs capitalize"
                        >
                          {user.role || 'consumer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isInactive ? (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-300 bg-red-50">
                            Inactive
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.emailVerifiedAt ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground text-xs">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setViewUser(user)}
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isInactive && (
                            <Select
                              value={user.role || 'consumer'}
                              onValueChange={(v) => updateRole(user.id, v)}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="consumer">Consumer</SelectItem>
                                <SelectItem value="affiliate">Affiliate</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {isInactive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                              onClick={() => {
                                setActionTarget(user)
                                setActionType('reactivate')
                              }}
                              title="Reactivate user"
                            >
                              <UserCheck className="w-4 h-4 mr-1" /> Reactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setActionTarget(user)
                                setActionType('deactivate')
                              }}
                              title="Deactivate user"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Deactivate / Reactivate Confirmation Dialog */}
      <Dialog
        open={!!actionTarget}
        onOpenChange={() => {
          setActionTarget(null)
          setActionType(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'deactivate' ? 'Deactivate User' : 'Reactivate User'}
            </DialogTitle>
          </DialogHeader>
          {actionType === 'deactivate' ? (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to deactivate{' '}
              <strong>{actionTarget?.fullName || actionTarget?.email}</strong>? Their account and
              all data will be preserved, but they will no longer be able to log in.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Reactivate <strong>{actionTarget?.fullName || actionTarget?.email}</strong>? They will
              regain full access to the platform.
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setActionTarget(null)
                setActionType(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'deactivate' ? 'destructive' : 'default'}
              className={actionType === 'reactivate' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={confirmAction}
              disabled={processing}
            >
              {processing
                ? 'Processing…'
                : actionType === 'deactivate'
                  ? 'Deactivate'
                  : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Sheet */}
      <UserDetailSheet
        user={viewUser}
        open={!!viewUser}
        onClose={() => setViewUser(null)}
      />
    </DashboardLayout>
  )
}
