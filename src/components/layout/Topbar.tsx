'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, X, Sun, Moon, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { useTheme } from 'next-themes';

interface Notification { id: string; message: string; type: 'warning' | 'info'; time: string; }

export default function Topbar() {
  const pathname = usePathname();
  const { shop } = useAuthStore();
  const { setMobileMenuOpen } = useLayoutStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const pageTitle: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pos': 'POS Terminal',
    '/invoices': 'Invoices',
    '/products': 'Products',
    '/inventory': 'Inventory',
    '/customers': 'Customers',
    '/reports': 'Reports',
    '/settings': 'Settings',
    '/settings/users': 'Staff Management',
  };

  const title = Object.entries(pageTitle).find(([k]) => pathname.startsWith(k))?.[1] || 'Dashboard';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    setMounted(true);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground">{title}</h1>
          <p className="text-[10px] text-muted-foreground font-mono">{shop?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover-bg)] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Notification bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4d6d] rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 glass-card border border-border shadow-float z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-medium text-foreground">Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-xs text-muted-foreground hover:text-[#ff4d6d]">Clear all</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">No new notifications</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-border hover:bg-muted">
                      <p className="text-xs text-secondary-foreground">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
