import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu, Home, Package, BarChart3, Link2, Users,
  LogOut, FileText, DollarSign, ChevronLeft, Store, UserCircle,
  Mail, Newspaper, BookOpen, Send, MousePointer, TrendingUp, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BrandLogo from '@/components/shared/BrandLogo';
import { cn } from '@/lib/utils';

const menuItems = {
  vendor: [
  { icon: Home, label: 'Overview', path: '/vendor' },
  { icon: Package, label: 'Products', path: '/vendor/products' },
  { icon: BarChart3, label: 'Analytics', path: '/vendor/analytics' },
  { icon: DollarSign, label: 'Earnings', path: '/vendor/earnings' },
  { icon: Store, label: 'Store Profile', path: '/vendor/profile' }],

  affiliate: [
  { icon: Home, label: 'Overview', path: '/affiliate' },
  { icon: Package, label: 'Find Products', path: '/affiliate/products' },
  { icon: Link2, label: 'My Links', path: '/affiliate/links' },
  { icon: BarChart3, label: 'Performance', path: '/affiliate/performance' },
  { icon: DollarSign, label: 'Earnings', path: '/affiliate/earnings' },
  { icon: UserCircle, label: 'My Profile', path: '/affiliate/profile' }],

  admin: [
  { icon: Home, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Mail, label: 'Subscribers', path: '/admin/subscribers' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FileText, label: 'Orders', path: '/admin/orders' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: MousePointer, label: 'Conversions', path: '/admin/conversions' },
  { icon: Newspaper, label: 'Newsletters', path: '/admin/newsletters' },
  { icon: Mail, label: 'Composer', path: '/admin/newsletter' },
  { icon: Send, label: 'Email Campaigns', path: '/admin/email-campaigns' },
  { icon: BookOpen, label: 'Blog', path: '/admin/blog' },
  { icon: Image, label: 'Hero Banner', path: '/admin/hero-banner' }]

};

function Sidebar({ role, collapsed, onToggle }) {
  const location = useLocation();
  const items = menuItems[role] || [];

  return (
    <div
      className={cn("h-full flex flex-col transition-all duration-300", collapsed ? "w-16" : "w-60")}
      style={{ background: '#001845', color: '#E8EDF5', minWidth: collapsed ? '4rem' : '15rem' }}
    >
      <div className="p-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {!collapsed && <BrandLogo size={32} darkBg={true} />}
        <Button variant="ghost" size="icon" onClick={onToggle} className="shrink-0" style={{ color: '#8099BB' }}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <div className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer",
                  collapsed && "justify-center px-2"
                )}
                style={{
                  background: isActive ? 'rgba(129,193,75,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #81C14B' : '3px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" style={{ color: isActive ? '#81C14B' : '#8099BB' }} />
                {!collapsed && (
                  <span className="text-sm font-medium" style={{ color: isActive ? '#81C14B' : '#E8EDF5' }}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Link to="/">
          <div
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150", collapsed && "justify-center px-2")}
            style={{ color: '#8099BB' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#E8EDF5'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8099BB'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Back to Site</span>}
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:h-screen md:shrink-0">
        <Sidebar role={role} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      
      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60" style={{ background: '#001845' }}>
          <Sidebar role={role} collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0 bg-white border-b border-gray-200">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm capitalize text-muted-foreground">{role} Dashboard</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>);

}