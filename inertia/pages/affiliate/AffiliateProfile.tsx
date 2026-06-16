import DashboardLayout from '@/components/layout/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Globe, Mail, AtSign, Video, Phone, MapPin, CheckCircle2, Edit2, Save, Zap } from 'lucide-react';
import { toast } from 'sonner';

type AffiliateProfileProps = {
  user: any
}


export default function AffiliateProfile(props: AffiliateProfileProps) {
  const { user: currentUser } = props
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    phone: '',
    website: '',
    instagram: '',
    twitter: '',
    youtube: '',
    location: '',
    marketing_channels: '',
    niche: '',
    profile_picture: ''
  });

  useEffect(() => {
    [].then((u) => {
      setUser(u);
      setForm({
        bio: u.bio || '',
        phone: u.phone || '',
        website: u.website || '',
        instagram: u.instagram || '',
        twitter: u.twitter || '',
        youtube: u.youtube || '',
        location: u.location || '',
        marketing_channels: u.marketing_channels || '',
        niche: u.niche || '',
        profile_picture: u.profile_picture || ''
      });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    setUser((prev) => ({ ...prev, ...form }));
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated!');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-[#715AFF]" />
            Affiliate Profile
          </h1>
          <p className="text-muted-foreground text-sm">Your affiliate identity on Plenty Value</p>
        </div>
        <Button
          variant={editing ? 'default' : 'outline'}
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
          style={editing ? { backgroundColor: '#715AFF', color: '#fff' } : {}}>
          
          {editing ? <><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</> : <><Edit2 className="w-4 h-4 mr-2" />Edit Profile</>}
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-28 relative text-[hsl(var(--card))] bg-[hsl(var(--success))]" style={{ background: 'linear-gradient(135deg, #715AFF 0%, #001845 100%)' }} />
        <CardContent className="pt-0 pb-5 px-6 relative">
          <div className="-mt-10 mb-4 flex items-end gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {form.profile_picture ?
              <img src={form.profile_picture} alt="Profile" className="w-full h-full object-cover" /> :

              <div className="w-full h-full flex items-center justify-center bg-[#715AFF]/10">
                  <UserCircle className="w-10 h-10 text-[#715AFF]" />
                </div>
              }
            </div>
            <div className="mb-2">
              <h2 className="font-bold text-lg text-[hsl(var(--foreground))]">{user.full_name || 'Affiliate'}</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#715AFF] text-white border-0 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Affiliate
                </Badge>
                {form.niche &&
                <Badge variant="outline" className="text-xs">{form.niche}</Badge>
                }
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{form.bio || 'No bio yet.'}</p>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lagos, Nigeria" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Niche / Focus Area</Label>
              <Input disabled={!editing} value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="e.g. Health & Wellness" />
            </div>
            <div className="col-span-2">
              <Label>Bio</Label>
              <Textarea disabled={!editing} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell sellers what makes you a great affiliate..." />
            </div>
            <div className="col-span-2">
              <Label>Marketing Channels</Label>
              <Input disabled={!editing} value={form.marketing_channels} onChange={(e) => setForm({ ...form, marketing_channels: e.target.value })} placeholder="e.g. WhatsApp, Mail, Email, Blog, YouTube" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social & Contact */}
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
                <Input disabled={!editing} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Website / Blog</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@yourhandle" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>AtSign / X</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="@yourhandle" className="pl-9" />
              </div>
            </div>
            <div>
              <Label>YouTube</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input disabled={!editing} value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="youtube.com/..." className="pl-9" />
              </div>
            </div>
            <div>
              <Label>Profile Picture URL</Label>
              <Input disabled={!editing} value={form.profile_picture} onChange={(e) => setForm({ ...form, profile_picture: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Score (read-only) */}
      <Card className="border-[#715AFF]/30 bg-[#715AFF]/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#715AFF]" />
            <div>
              <p className="font-semibold text-sm">Affiliate Performance Score</p>
              <p className="text-xs text-muted-foreground">Complete your profile to increase your visibility to sellers</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-[#715AFF]">
                {[form.bio, form.instagram, form.marketing_channels, form.niche, form.profile_picture].filter(Boolean).length * 20}%
              </p>
              <p className="text-xs text-muted-foreground">Profile complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

}


