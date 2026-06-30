import React, { useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, User, ChevronDown, ShoppingBag, TrendingUp } from 'lucide-react'
import BrandLogo from '@/components/shared/BrandLogo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const { url } = usePage()

  const navLinks = [
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Reviews', path: '/reviews' },
  ]

  const getDashboardLink = () => {
    if (!user) return null
    if (user.role === 'admin') return '/admin'
    if (user.role === 'vendor') return '/vendor'
    if (user.role === 'affiliate') return '/affiliate'
    return null
  }

  const isActive = (path) => url === path || url?.startsWith(path + '/')

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <BrandLogo size={38} />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-medium transition-colors ${isActive(link.path) ? 'text-[#001845] bg-[#001845]/8' : 'text-foreground hover:text-[#001845]'}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {/* For Partners dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-medium transition-colors ${isActive('/for-partners') ? 'text-[#001845] bg-[#001845]/8' : 'text-foreground hover:text-[#001845]'}`}
                >
                  For Partners <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-60 p-2">
                <DropdownMenuItem asChild>
                  <Link
                    href="/for-partners#vendor"
                    className="flex items-start gap-3 p-2 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#001845' }}
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Become a Vendor</p>
                      <p className="text-xs text-muted-foreground">
                        Sell products & grow your brand
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/for-partners#affiliate"
                    className="flex items-start gap-3 p-2 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#81C14B' }}
                    >
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Become an Affiliate</p>
                      <p className="text-xs text-muted-foreground">
                        Promote products & earn commissions
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#001845' }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{user.fullName || user.email}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {getDashboardLink() && (
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive">
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="font-semibold text-white"
                    style={{ backgroundColor: '#001845' }}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} href={link.path} onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start font-medium ${isActive(link.path) ? 'text-[#001845]' : ''}`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t pt-3 mt-2">
                  <p className="px-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    For Partners
                  </p>
                  <Link href="/for-partners" onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" style={{ color: '#001845' }} /> Become a
                      Vendor
                    </Button>
                  </Link>
                  <Link href="/for-partners" onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm gap-2"
                    >
                      <TrendingUp className="w-4 h-4" style={{ color: '#81C14B' }} /> Become an
                      Affiliate
                    </Button>
                  </Link>
                </div>
                <div className="border-t pt-3 mt-2">
                  {user ? (
                    <>
                      {getDashboardLink() && (
                        <Link href={getDashboardLink()} onClick={() => setOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                        onClick={onLogout}
                      >
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Log In
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setOpen(false)}>
                        <Button
                          className="w-full mt-2 font-semibold text-white"
                          style={{ backgroundColor: '#001845' }}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
