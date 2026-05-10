'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
    else router.replace('/auth/login');
  }, [isAuthenticated, router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent animate-spin" />
        <span className="text-muted-foreground font-medium">Loading...</span>
      </div>
    </div>
  );
}
