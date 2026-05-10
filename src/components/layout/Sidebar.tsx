'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useLayoutStore } from '@/stores/layoutStore';
import {
  LayoutDashboard, ShoppingCart, FileText, Package, BarChart3,
  Users, Settings, LogOut, Zap, ChevronLeft, ChevronRight,
  Boxes, UserCog, Bell
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/pos', icon: ShoppingCart, label: 'POS Terminal' },
  { href: '/invoices', icon: FileText, label: 'Invoices' },
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/inventory', icon: Boxes, label: 'Inventory' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
];

const adminItems = [
  { href: '/settings/users', icon: UserCog, label: 'Staff' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, shop, logout } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen } = useLayoutStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); router.replace('/auth/login'); };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  return (
    <aside
      style={{ width: collapsed ? '72px' : '240px', minWidth: collapsed ? '72px' : '240px' }}
      className={`flex flex-col h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 border-r border-border bg-sidebar
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #4cd6ff, #00e1ab)' }}>
            <Zap className="w-4 h-4 text-[#101319]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-display font-semibold text-foreground truncate">{shop?.name || 'BillMate Pro'}</div>
              <div className="text-[10px] text-muted-foreground font-mono truncate">{shop?.gst_number || 'No GST'}</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`nav-item ${active ? 'active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}

        {user?.role === 'ADMIN' && (
          <>
            <div className="pt-4 pb-2">
              {!collapsed && <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 font-medium">Admin</div>}
              {collapsed && <div className="border-t border-border pt-2" />}
            </div>
            {adminItems.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`nav-item ${active ? 'active' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-3 p-2 rounded-lg mb-2 ${!collapsed ? 'bg-card' : ''}`}>
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[#101319] text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #4cd6ff, #00e1ab)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-medium text-foreground truncate">{user?.name}</div>
              <div className={`text-[10px] font-medium ${user?.role === 'ADMIN' ? 'text-[#4cd6ff]' : 'text-muted-foreground'}`}>
                {user?.role}
              </div>
            </div>
          )}
        </div>
        <button onClick={handleLogout}
          className="nav-item w-full text-[#ff4d6d] hover:text-[#ff4d6d] hover:bg-[#ff4d6d]/10"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
