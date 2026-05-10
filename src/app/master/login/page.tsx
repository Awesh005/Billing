'use client';
import dynamic from 'next/dynamic';

const MasterLoginPageContent = dynamic(() => import('./MasterLoginPageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <div className="w-8 h-8 rounded-full border-2 border-t-red-500 border-r-red-500 border-b-transparent border-l-transparent animate-spin" />
    </div>
  ),
});

export default function MasterLoginPage() {
  return <MasterLoginPageContent />;
}
