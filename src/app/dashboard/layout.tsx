"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Home, Calendar, BookOpen, Settings } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/auth/signin');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold">Host Dashboard</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" />
          <NavItem href="/dashboard/properties" icon={<Home size={20} />} label="Properties" />
          <NavItem href="/dashboard/bookings" icon={<BookOpen size={20} />} label="Bookings" />
          <NavItem href="/dashboard/calendar" icon={<Calendar size={20} />} label="Calendar" />
          <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 w-full">
        <h2 className="text-xl font-bold">Host Dashboard</h2>
        {/* Mobile menu button would go here */}
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(href);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(href);
    }
  };
  
  return (
    <Link 
      href={href}
      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      tabIndex={0}
      aria-label={label}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <span>{label}</span>
    </Link>
  );
} 