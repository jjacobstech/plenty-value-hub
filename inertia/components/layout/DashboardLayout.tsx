import { useState, useEffect } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Menu,
  Home,
  Package,
  BarChart3,
  Link2,
  Users,
  LogOut,
  FileText,
  DollarSign,
  ChevronLeft,
  Store,
  UserCircle,
  Mail,
  Newspaper,
  BookOpen,
  Send,
  MousePointer,
  Image,
  Wallet,
} from 'lucide-react'
import BrandLogo from '@/components/shared/BrandLogo'
import { cn } from '@/lib/utils'
import { CURRENCY_SYMBOLS } from '@/lib/currency'

type Role = 'vendor' | 'affiliate' | 'admin'

type MenuItem = { icon: React.ElementType; label: string; path: string }

const getPathname = (url: string) => url.split(/[?#]/)[0] || '/'

const isActivePath = (currentUrl: string, targetPath: string) => {
  const pathname = getPathname(currentUrl)
  if (pathname === targetPath) return true
  return targetPath !== '/' && pathname.startsWith(`${targetPath}/`)
}

const getActivePath = (currentUrl: string, items: MenuItem[]) => {
  const pathname = getPathname(currentUrl)
  return [...items]
    .filter((item) => isActivePath(pathname, item.path))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path
}

const menuItems: Record<Role, MenuItem[]> = {
  vendor: [
    { icon: Home, label: 'Overview', path: '/vendor' },
    { icon: Package, label: 'Products', path: '/vendor/products' },
    { icon: BarChart3, label: 'Analytics', path: '/vendor/analytics' },
    { icon: DollarSign, label: 'Earnings', path: '/vendor/earnings' },
    { icon: Store, label: 'Store Profile', path: '/vendor/profile' },
  ],

  affiliate: [
    { icon: Home, label: 'Overview', path: '/affiliate' },
    { icon: Package, label: 'Find Products', path: '/affiliate/products' },
    { icon: Link2, label: 'My Links', path: '/affiliate/links' },
    { icon: BarChart3, label: 'Performance', path: '/affiliate/performance' },
    { icon: DollarSign, label: 'Earnings', path: '/affiliate/earnings' },
    { icon: UserCircle, label: 'My Profile', path: '/affiliate/profile' },
  ],

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
    { icon: Image, label: 'Hero Banner', path: '/admin/hero-banner' },
    { icon: DollarSign, label: 'Payments', path: '/admin/payment-settings' },
    { icon: Wallet, label: 'Payouts', path: '/admin/payouts' },
  ],
}

function Sidebar({
  role,
  collapsed,
  onToggle,
}: {
  role: Role
  collapsed: boolean
  onToggle: () => void
}) {
  const { url } = usePage()
  const items = menuItems[role] || []
  const activePath = getActivePath(url, items)

  return (
    <div
      className={cn(
        'h-full flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ background: '#001845', color: '#E8EDF5', minWidth: collapsed ? '4rem' : '15rem' }}
    >
      <div
        className="p-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        {!collapsed && <BrandLogo size={32} darkBg={true} linkTo="/" />}
        <Button
          variant="secondary"
          size="icon"
          onClick={onToggle}
          className="shrink-0"
          style={{ color: '#ffffff' }}
        >
          <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      <div
        className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item) => {
          const isActive = activePath === item.path
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer',
                  collapsed && 'justify-center px-2'
                )}
                style={{
                  background: isActive ? 'rgba(129,193,75,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #81C14B' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <item.icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? '#81C14B' : '#8099BB' }}
                />
                {!collapsed && (
                  <span
                    className="text-sm font-medium"
                    style={{ color: isActive ? '#81C14B' : '#E8EDF5' }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150',
              collapsed && 'justify-center px-2'
            )}
            style={{ color: '#8099BB' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#E8EDF5'
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8099BB'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Back to Site</span>}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode
  role: Role
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, currencySymbol, systemCurrency } = usePage().props as any

  const symbol = currencySymbol || (systemCurrency ? CURRENCY_SYMBOLS[systemCurrency] : '$') || '$'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).__currencySymbol = symbol
    }
  }, [symbol])

  const handleLogout = () => router.post('/logout')

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
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm capitalize text-muted-foreground">{role} Dashboard</span>
            {user && <span className="text-sm font-medium">{user.fullName || user.email}</span>}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-white"
            >
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}
