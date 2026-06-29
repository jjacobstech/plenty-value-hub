import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { base44 } from '@/api/base44Client';

export default function PublicLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const u = await base44.auth.me();
        setUser(u);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="flex-1">
        <Outlet context={{ user }} />
      </main>
      <Footer />
    </div>
  );
}