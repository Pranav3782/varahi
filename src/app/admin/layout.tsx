"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Toaster } from '@/components/ui/toaster';
import { useUser } from '@/firebase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const ADMIN_EMAIL = 'vivanfarmsnatural@gmail.com';

  useEffect(() => {
    if (!isUserLoading && (!user || user.email !== ADMIN_EMAIL) && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router, pathname]);

  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  if (isUserLoading) {
    return <div className="min-h-screen bg-[#F9F6EF] flex items-center justify-center font-headline text-3xl font-extrabold text-primary animate-pulse">Loading Dashboard...</div>;
  }

  // Final gate check for authorized email
  if (!user || user.email !== ADMIN_EMAIL) {
    return null; // The useEffect will handle redirect
  }

  return (
    <div className="min-h-screen bg-[#F9F6EF] font-body text-[#100C06] flex flex-col md:flex-row">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden bg-[#0F0F11] text-white h-16 px-4 flex items-center justify-between sticky top-0 z-30 border-b border-white/10 shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-primary">
            <i className="fa-solid fa-leaf text-base text-white"></i>
          </div>
          <div>
            <span className="text-lg font-headline font-extrabold tracking-tight">VIVAAN</span>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-[2px] block -mt-1">Admin</span>
          </div>
        </Link>
        <button 
          onClick={() => setMobileNavOpen(true)}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>
      </header>

      {/* Desktop Fixed Sidebar */}
      <AdminSidebar className="hidden md:flex" />

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 w-[280px] max-w-[80vw] h-full shadow-2xl">
            <AdminSidebar onClose={() => setMobileNavOpen(false)} className="h-full w-full" />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 lg:p-14 max-w-[1600px] w-full mx-auto overflow-x-hidden">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
