'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import ToastContainer from './Toast';
import ErrorBoundary from './ErrorBoundary';
import CommandPalette from './CommandPalette';

const PUBLIC_ROUTES = ['/login', '/signup', '/landing'];

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isPublicSite = pathname.startsWith('/site');
  const isAuthRoute = PUBLIC_ROUTES.includes(pathname);
  const isUnauthHome = pathname === '/' && !user && !loading;

  if (isAuthRoute || isPublicSite || isUnauthHome) {
    // Full screen view without sidebar
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
      <CommandPalette />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <ShellContent>{children}</ShellContent>
      </ErrorBoundary>
      <ToastContainer />
    </AuthProvider>
  );
}
