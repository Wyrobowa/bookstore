'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { AppLayout, Header, NavBar } from 'tharaday';

import {
  authChangedEventName,
  clearAuthSession,
  readAuthSession,
} from '@/lib/auth';

export default function ClientShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);

  const syncUserFromStorage = useCallback(() => {
    const session = readAuthSession();
    setUserName(session?.user?.name ?? null);
  }, []);

  useEffect(() => {
    syncUserFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'bookstore_auth_session') {
        syncUserFromStorage();
      }
    };
    const handleAuthChanged = () => {
      syncUserFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(authChangedEventName, handleAuthChanged);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(authChangedEventName, handleAuthChanged);
    };
  }, [syncUserFromStorage]);

  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  const activeNavId =
    normalizedPathname === '/books' || normalizedPathname === '/book'
      ? 'books'
      : normalizedPathname === '/account'
        ? 'account'
        : 'home';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'books', label: 'Books' },
    ...(userName ? [{ id: 'account', label: 'Account' }] : []),
  ];

  const handleNavItemClick = (id: string) => {
    if (id === 'home') {
      router.push('/');
      return;
    }
    router.push(`/${id}`);
  };

  const handleLogout = () => {
    clearAuthSession();
    setUserName(null);
    router.push('/');
  };

  return (
    <AppLayout
      maxWidth="90%"
      header={
        <Header
          title="Bookstore"
          user={userName ? { name: userName } : undefined}
          onLogin={() => router.push('/login')}
          onLogout={handleLogout}
          maxWidth="90%"
        />
      }
      navbar={
        <NavBar
          items={navItems}
          activeId={activeNavId}
          onItemClick={handleNavItemClick}
          maxWidth="90%"
        />
      }
    >
      {children}
    </AppLayout>
  );
}
