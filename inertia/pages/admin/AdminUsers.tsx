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
import { Input } from '@/components/ui/input'
import { Search, CheckCircle, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/api/http-client'

type AdminUsersProps = {
  users: any[]
}

export default function AdminUsers(props: AdminUsersProps) {
  const [users, setUsers] = useState(props.users)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionTarget, setActionTarget] = useState<any | null>(null)
  const [actionType, setActionType] = useState<'deactivate' | 'reactivate' | null>(null)
  const [processing, setProcessing] = useState(false)

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
    </DashboardLayout>
  )
}
