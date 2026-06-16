import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  health_fitness: 'Health', business_investing: 'Business', software_saas: 'Software',
  ecommerce: 'E-Commerce', education: 'Education', fashion: 'Fashion', beauty: 'Beauty',
  home_garden: 'Home', technology: 'Tech', finance: 'Finance', digital_services: 'Digital',
  ai_tools: 'AI', productivity: 'Productivity', lifestyle: 'Lifestyle',
};

type AdminProductsProps = {
  products: any[]
}


export default function AdminProducts(props: AdminProductsProps) {
  const { products } = props
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-products']);
      toast.success('Product updated');
    },
  });

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors = { pending: 'secondary', approved: 'default', rejected: 'destructive', archived: 'outline' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage and moderate marketplace products</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.vendor_name || '—'}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{CATEGORY_LABELS[p.category] || p.category}</Badge></TableCell>
                  <TableCell>${p.price?.toFixed(2)}</TableCell>
                  <TableCell>{p.commission_rate}%</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[p.status] || 'secondary'} className="text-xs capitalize">{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => updateMutation.mutate({ id: p.id, data: { is_featured: !p.is_featured } })}
                    >
                      <Star className={`w-4 h-4 ${p.is_featured ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-green-600 h-8 px-2"
                        onClick={() => updateMutation.mutate({ id: p.id, data: { status: 'approved' } })}>
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive h-8 px-2"
                        onClick={() => updateMutation.mutate({ id: p.id, data: { status: 'rejected' } })}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
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


