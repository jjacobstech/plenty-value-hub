import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatUSD as formatNGN } from '@/lib/currency';
import { toast } from 'sonner';

const CATEGORIES = [
  { label: 'Health & Fitness', value: 'health_fitness' },
  { label: 'Business & Investing', value: 'business_investing' },
  { label: 'Software & SaaS', value: 'software_saas' },
  { label: 'Education', value: 'education' },
  { label: 'Technology', value: 'technology' },
  { label: 'AI Tools', value: 'ai_tools' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Home & Garden', value: 'home_garden' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'E-Commerce', value: 'ecommerce' },
  { label: 'Finance', value: 'finance' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Digital Services', value: 'digital_services' },
];

const defaultForm = {
  name: '', description: '', short_description: '', category: 'technology',
  product_type: 'digital', price: '', sale_price: '', commission_rate: '30',
  image_url: '', recurring_billing: false, billing_cycle: 'one_time',
};

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-500',
};

type VendorProductsProps = {
  products: any[]
}


export default function VendorProducts(props: VendorProductsProps) {
  const { products } = props
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { [].then(setUser); }, []);


  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
        commission_rate: parseFloat(data.commission_rate),
        vendor_id: user.id,
        vendor_name: user.full_name || 'Vendor',
      };
      if (editId) return apiClient.put(editId, payload);
      return apiClient.post(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vendor-products']);
      toast.success(editId ? 'Product updated successfully' : 'Product submitted for review');
      setShowForm(false);
      setEditId(null);
      setForm(defaultForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendor-products']);
      toast.success('Product deleted');
    },
  });

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      short_description: product.short_description || '',
      category: product.category || 'technology',
      product_type: product.product_type || 'digital',
      price: product.price?.toString() || '',
      sale_price: product.sale_price?.toString() || '',
      commission_rate: product.commission_rate?.toString() || '30',
      image_url: product.image_url || '',
      recurring_billing: product.recurring_billing || false,
      billing_cycle: product.billing_cycle || 'one_time',
    });
    setShowForm(true);
  };

  const approvedCount = products.filter(p => p.status === 'approved').length;
  const pendingCount = products.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-[#81C14B]" />
            My Products
          </h1>
          <p className="text-muted-foreground text-sm">{approvedCount} active · {pendingCount} pending review</p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
          style={{ backgroundColor: '#001845' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: products.length, color: 'text-[#001845]' },
          { label: 'Approved', value: approvedCount, color: 'text-green-600' },
          { label: 'Pending Review', value: pendingCount, color: 'text-amber-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Product Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Enter product name" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product Type</Label>
                <Select value={form.product_type} onValueChange={v => setForm({ ...form, product_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (USD) *</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="e.g. 29.99" />
              </div>
              <div>
                <Label>Sale Price (USD)</Label>
                <Input type="number" step="0.01" min="0" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <Label>Commission Rate (%)</Label>
                <Input type="number" min="1" max="75" value={form.commission_rate} onChange={e => setForm({ ...form, commission_rate: e.target.value })} required />
                {form.price && form.commission_rate && (
                  <p className="text-xs text-green-600 mt-1">
                    Affiliates earn: {formatNGN((parseFloat(form.price) || 0) * (parseFloat(form.commission_rate) || 0) / 100)} per sale
                  </p>
                )}
              </div>
              <div>
                <Label>Product Image URL</Label>
                <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Billing</Label>
                <Select value={form.billing_cycle} onValueChange={v => setForm({ ...form, billing_cycle: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Short Description</Label>
                <Input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} placeholder="Brief product tagline" />
              </div>
              <div className="col-span-2">
                <Label>Full Description</Label>
                <Textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed product description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending} style={{ backgroundColor: '#001845' }} className="text-white">
                {saveMutation.isPending ? 'Saving...' : editId ? 'Update Product' : 'Submit for Approval'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price ($)</TableHead>
                   <TableHead>Commission</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Sales</TableHead>
                   <TableHead>Revenue ($)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.image_url && (
                          <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{p.product_type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatNGN(p.price)}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-semibold">{p.commission_rate}%</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[p.status] || 'bg-slate-100 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell>{p.total_sales || 0}</TableCell>
                    <TableCell>{formatNGN(p.total_revenue)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No products yet. Add your first listing!</p>
              <Button onClick={() => setShowForm(true)} style={{ backgroundColor: '#001845' }} className="text-white">
                <Plus className="w-4 h-4 mr-2" /> Add First Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


