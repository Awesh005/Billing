'use client';
import dynamic from 'next/dynamic';

const LoginPageContent = dynamic(() => import('./LoginPageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent animate-spin" />
    </div>
  ),
});

export default function LoginPage() {
  return <LoginPageContent />;
}
