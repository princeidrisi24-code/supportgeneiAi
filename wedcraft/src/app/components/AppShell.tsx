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
  const pathname = usePathname() || '';
  const { user } = useAuth();

  // Normalize path by stripping trailing slashes (e.g. /login/ -> /login)
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const isPublicSite = cleanPath.startsWith('/site');
  const isAuthRoute = PUBLIC_ROUTES.includes(cleanPath);

  // If user is not logged in, or browsing public/auth pages, NEVER show sidebar
  if (!user || isAuthRoute || isPublicSite) {
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
