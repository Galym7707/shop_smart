// frontend/components/Header.tsx
"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // Изменено с @/context/AuthContext
import ThemeSwitcher from './ThemeSwitcher';    // Этот путь уже был относительным

export default function Header() {
    const { user, logout, loading, isAuthenticated } = useAuth();

    return (
        <header className="bg-gray-700 dark:bg-gray-900 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-300 hover:text-blue-200 transition-colors">
                    ShopSmart
                </Link>
                <nav className="flex items-center space-x-2 sm:space-x-4">
                    <Link href="/lists" className="text-sm sm:text-base hover:text-blue-300 transition-colors">
                        My Lists
                    </Link>
                    <Link href="/ai-suggest" className="text-sm sm:text-base hover:text-blue-300 transition-colors">
                        AI Suggest
                    </Link>
                    
                    <ThemeSwitcher />

                    {!loading && (
                        isAuthenticated && user ? (
                            <>
                                <Link href="/profile" className="text-sm sm:text-base hover:text-blue-300 transition-colors">
                                    {user.username || user.email.split('@')[0]}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm sm:text-base hover:text-blue-300 transition-colors">
                                    Login
                                </Link>
                                <Link 
                                    href="/register" 
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )
                    )}
                    {loading && <div className="text-xs sm:text-sm text-gray-400">Loading...</div>}
                </nav>
            </div>
        </header>
    );
}
