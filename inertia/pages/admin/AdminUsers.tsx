import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type AdminUsersProps = {
  users: any[]
}


export default function AdminUsers(props: AdminUsersProps) {
  const { users } = props
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User updated');
    },
  });

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColors = { admin: 'destructive', vendor: 'default', affiliate: 'secondary', consumer: 'outline' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage platform users and roles</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
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
        <CardContent className="p-0">
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
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleColors[user.role] || 'outline'} className="text-xs capitalize">{user.role || 'consumer'}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_verified ? <CheckCircle className="w-4 h-4 text-green-600" /> : <span className="text-muted-foreground text-xs">No</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <Select value={user.role || 'consumer'} onValueChange={v => updateMutation.mutate({ id: user.id, data: { role: v } })}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
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
  );
}


