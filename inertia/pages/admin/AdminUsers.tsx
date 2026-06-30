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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle } from 'lucide-react'
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

  const updateRole = async (id: number, role: string) => {
    try {
      await api.put(`/api/users/${id}`, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
      toast.success('User updated')
    } catch {
      toast.error('Failed to update user')
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
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
          <p className="text-muted-foreground">Manage platform users and roles</p>
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
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
