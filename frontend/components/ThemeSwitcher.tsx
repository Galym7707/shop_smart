// frontend/components/ThemeSwitcher.tsx
"use client";

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react'; // Пример использования иконок

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5 text-white" />
            ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
            )}
        </button>
    );
}
