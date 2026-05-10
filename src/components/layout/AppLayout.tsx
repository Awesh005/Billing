'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useLayoutStore } from '@/stores/layoutStore';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen } = useLayoutStore();
  const router = useRouter();
  // mounted guard: prevents server/client mismatch caused by Zustand's
  // localStorage persist. Server has no localStorage so isAuthenticated
  // is always false there; we render a neutral shell until client mounts.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace('/auth/login');
  }, [mounted, isAuthenticated, router]);

  // Neutral shell rendered on server AND during client mount —
  // no mismatch possible because both sides render identical HTML.
  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
