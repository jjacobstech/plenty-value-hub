import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Building2, Globe, MapPin, Phone, Link, FileText, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Company (LLC)',
  'Corporation',
  'Non-Profit Organization',
  'Freelancer / Individual',
  'Other',
];

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
  'Ethiopia', 'Rwanda', 'Senegal', 'Côte d\'Ivoire', 'United States',
  'United Kingdom', 'Canada', 'Australia', 'Other',
];

export default function VendorKYC({ onComplete }) {
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    country: '',
    state: '',
    socialMedia: '',
    website: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const required = ['businessName', 'businessType', 'country', 'state', 'socialMedia', 'description', 'contactPhone'];
    const newErrors = {};
    required.forEach(f => {
      if (!form[f]) newErrors[f] = 'This field is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onComplete(form);
  };

  const Field = ({ id, label, required, children }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#001845' }}>
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: '#001845' }}>Vendor Verification</h2>
        <p className="text-muted-foreground text-sm mt-1">Help us verify your business to maintain marketplace quality</p>
      </div>

      {/* Trust bar */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#81C14B' }} />
        <p className="text-sm text-green-800">KYC verification builds buyer trust and improves your sales performance.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">

        {/* Business Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Business Information
          </h3>
          <div className="space-y-4">
            <Field id="businessName" label="Business Name" required>
              <Input
                id="businessName"
                placeholder="Your business or brand name"
                value={form.businessName}
                onChange={e => update('businessName', e.target.value)}
                className={`h-11 ${errors.businessName ? 'border-red-400' : ''}`}
              />
            </Field>

            <Field id="businessType" label="Type of Business" required>
              <Select value={form.businessType} onValueChange={v => update('businessType', v)}>
                <SelectTrigger className={`h-11 ${errors.businessType ? 'border-red-400' : ''}`}>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field id="description" label="Business Description" required>
              <Textarea
                id="description"
                placeholder="Briefly describe your business and the products you plan to sell..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                className={errors.description ? 'border-red-400' : ''}
              />
            </Field>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field id="country" label="Country" required>
              <Select value={form.country} onValueChange={v => update('country', v)}>
                <SelectTrigger className={`h-11 ${errors.country ? 'border-red-400' : ''}`}>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field id="state" label="State / Region" required>
              <Input
                id="state"
                placeholder="e.g. Lagos, Nairobi"
                value={form.state}
                onChange={e => update('state', e.target.value)}
                className={`h-11 ${errors.state ? 'border-red-400' : ''}`}
              />
            </Field>
          </div>
        </div>

        {/* Online Presence */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Online Presence
          </h3>
          <div className="space-y-4">
            <Field id="socialMedia" label="Social Media Account / Page" required>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="socialMedia"
                  placeholder="Mail, Facebook, AtSign page URL"
                  value={form.socialMedia}
                  onChange={e => update('socialMedia', e.target.value)}
                  className={`pl-10 h-11 ${errors.socialMedia ? 'border-red-400' : ''}`}
                />
              </div>
            </Field>
            <Field id="website" label="Website URL (Optional)">
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  placeholder="https://yourbusiness.com"
                  value={form.website}
                  onChange={e => update('website', e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact Information
          </h3>
          <div className="space-y-4">
            <Field id="contactPhone" label="Phone Number" required>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={form.contactPhone}
                onChange={e => update('contactPhone', e.target.value)}
                className={`h-11 ${errors.contactPhone ? 'border-red-400' : ''}`}
              />
            </Field>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-semibold text-white" style={{ backgroundColor: '#001845' }}>
          Complete Verification & Continue
        </Button>
      </form>
    </div>
  );
}

VendorKYC.layout = (page: React.ReactNode) => <DashboardLayout role="vendor">{page}</DashboardLayout>