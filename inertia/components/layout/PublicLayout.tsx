import React from 'react';
import { usePage, router } from '@inertiajs/react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }) {
  const { user } = usePage().props as any;

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ?? null} onLogout={handleLogout} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}