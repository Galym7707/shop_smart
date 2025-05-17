// frontend/components/ThemeSwitcher.tsx
"use client";

import { useTheme } from '../context/ThemeContext'; // Змінено на відносний шлях
import { Sun, Moon } from 'lucide-react'; 

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-300 hover:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 dark:focus:ring-offset-gray-900 focus:ring-blue-500"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
            )}
        </button>
    );
}
