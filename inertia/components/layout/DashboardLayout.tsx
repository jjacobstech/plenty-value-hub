import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu, Home, Package, BarChart3, Link2, Users, Settings,
  LogOut, ShieldCheck, FileText, DollarSign, ChevronLeft, Store, UserCircle } from
'lucide-react';
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
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FileText, label: 'Orders', path: '/admin/orders' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' }]

};

function Sidebar({ role, collapsed, onToggle }) {
  const { url } = usePage();
  const items = menuItems[role] || [];

  return (
    <div className={cn(
      "h-full bg-secondary text-secondary-foreground flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
        {!collapsed &&
        <BrandLogo size={32} darkBg={true} />
        }
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-slate-400 hover:text-white shrink-0">
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <div className="flex-1 py-4 space-y-1 px-2">
        {items.map((item) =>
        <Link key={item.path} href={item.path}>
            <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 hover:text-white hover:bg-slate-700/50",
              url === item.path && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
              collapsed && "justify-center px-2"
            )}>
            
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Button>
          </Link>
        )}
      </div>
      <div className="p-2 border-t border-slate-700/50">
        <Link href="/">
          <Button variant="ghost" className={cn("w-full justify-start gap-3 hover:text-white text-[hsl(var(--card-foreground))]", collapsed && "justify-center px-2")}>
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span className="text-sm text-[hsl(var(--card-foreground))]">Back to Site</span>}
          </Button>
        </Link>
      </div>
    </div>);

}

export default function DashboardLayout({ children, role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = usePage().props as any;

  const handleLogout = () => router.post('/logout');

  return (
    <div className="h-screen flex bg-muted/50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar role={role} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 bg-secondary">
          <Sidebar role={role} collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-muted-foreground capitalize">{role} Dashboard</span>
            {user && (
              <span className="text-sm font-medium">{user.fullName || user.email}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>);

}