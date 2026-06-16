import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, Globe, Mail, AtSign, Phone, Mail, MapPin, CheckCircle2, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';

type VendorProfileProps = {
  user: any
}


export default function VendorProfile(props: VendorProfileProps) {
  const { user: currentUser } = props
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    business_description: '',
    phone: '',
    website: '',
    instagram: '',
    twitter: '',
    location: '',
    business_logo: '',
    cover_banner: '',
    product_categories: '',
  });

  useEffect(() => {
    [].then(u => {
      setUser(u);
      setForm({
        business_name: u.business_name || '',
        business_description: u.business_description || '',
        phone: u.phone || '',
        website: u.website || '',
        instagram: u.instagram || '',
        twitter: u.twitter || '',
        location: u.location || '',
        business_logo: u.business_logo || '',
        cover_banner: u.cover_banner || '',
        product_categories: u.product_categories || '',
      });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    setUser(prev => ({ ...prev, ...form }));
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-[#81C14B]" />
            Seller Profile
          </h1>
          <p className="text-muted-foreground text-sm">Your public seller page on Plenty Value</p>
        </div>
        <Button
          variant={editing ? 'default' : 'outline'}
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
          style={editing ? { backgroundColor: '#001845', color: '#fff' } : {}}
        >
          {editing ? <><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</> : <><Edit2 className="w-4 h-4 mr-2" />Edit Profile</>}
        </Button>
      </div>

      {/* Cover Banner */}
      <Card className="overflow-hidden">
        <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #001845 0%, #81C14B 100%)' }}>
          {form.cover_banner && (
            <img src={form.cover_banner} alt="Cover" className="w-full h-full object-cover absolute inset-0" />
          )}
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
              {form.business_logo ? (
                <img src={form.business_logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#81C14B]/10">
                  <Store className="w-8 h-8 text-[#81C14B]" />
                </div>
              )}
            </div>
            <div className="mb-1">
              <h2 className="text-white font-bold text-lg drop-shadow">{form.business_name || user.full_name || 'Your Business'}</h2>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-[#81C14B] text-white border-0 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Seller
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="pt-4 pb-5 px-6">
          <p className="text-sm text-muted-foreground">{form.business_description || 'No description yet.'}</p>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <Label>Business Name</Label>
              <Input disabled={!editing} value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="Your business name" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Lagos, Nigeria" className="pl-9" />
              </div>
            </div>
            <div className="col-span-2">
              <Label>Business Description</Label>
              <Textarea disabled={!editing} rows={3} value={form.business_description} onChange={e => setForm({ ...form, business_description: e.target.value })} placeholder="Tell customers about your business..." />
            </div>
            <div className="col-span-2">
              <Label>Product Categories (comma separated)</Label>
              <Input disabled={!editing} value={form.product_categories} onChange={e => setForm({ ...form, product_categories: e.target.value })} placeholder="e.g. Health, Education, Technology" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact & Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yoursite.com" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@yourhandle" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>AtSign / X</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} placeholder="@yourhandle" className="pl-9" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Business Logo URL</Label>
            <Input disabled={!editing} value={form.business_logo} onChange={e => setForm({ ...form, business_logo: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Cover Banner URL</Label>
            <Input disabled={!editing} value={form.cover_banner} onChange={e => setForm({ ...form, cover_banner: e.target.value })} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {!editing && (
        <div className="flex justify-center">
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}


