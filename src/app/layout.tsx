import type { Metadata } from "next";
// 🔴 1. Commented out to fix build error
// import { Inter } from "next/font/google"; 

import "./globals.css";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from "@/context/AuthContext"; 
import { Toaster } from 'sonner';

// 🔴 2. Commented out to fix build error
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yosola School Management System",
  description: "Comprehensive school management solution for Nigerian schools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 🟢 3. Replaced inter.className with standard "font-sans" */}
      <body className="font-sans antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <AuthProvider>
          {/* 🟢 4. Updated ThemeProvider to use your correct storage key */}
          <ThemeProvider 
            defaultTheme="light" 
            storageKey="yosola-theme" 
          >
             <Toaster position="top-right" richColors closeButton />
             {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
