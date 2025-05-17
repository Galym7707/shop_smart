'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header({ toggleTheme, theme }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Проверяем токен при монтировании
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Слушаем изменения в localStorage (например, после логина)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      setIsLoggedIn(!!newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); // Удаляем и refresh-токен
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className={`bg-primary ${theme === 'dark' ? 'dark:bg-gray-900' : ''} text-white py-6 sticky top-0 z-50 shadow-md transition-colors duration-300`}>
      <div className="container flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          <Link href="/" className="hover:text-secondary transition duration-200">
            ShopSmart
          </Link>
        </h1>
        <div className="flex items-center space-x-6">
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
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>
    </header>
  );
}