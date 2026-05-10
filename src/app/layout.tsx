import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillMate Pro — Multi-Tenant SaaS Billing & POS",
  description: "Professional billing, inventory, and point-of-sale system for modern businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem

        >
          <div id="app-wrapper">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
