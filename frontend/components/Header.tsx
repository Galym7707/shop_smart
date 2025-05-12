'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-primary text-white py-6 sticky top-0 z-50 shadow-md">
      <div className="container flex justify-between items-center">
        <h1 className="text-3xl font-bold">ShopSmart</h1>
        <nav className="space-x-6">
          <Link href="/" className="hover:text-secondary transition duration-200">
            Home
          </Link>
          <Link href="/ai-suggest" className="hover:text-secondary transition duration-200">
            AI Suggest
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/lists" className="hover:text-secondary transition duration-200">
                My Lists
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-secondary transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-secondary transition duration-200">
                Login
              </Link>
              <Link href="/register" className="hover:text-secondary transition duration-200">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}