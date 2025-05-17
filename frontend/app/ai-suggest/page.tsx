// frontend/app/ai-suggest/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Изменено с @/context/AuthContext (два уровня вверх)
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AISuggestPage() {
    const { token, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSuggest = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim()) {
            setError('Query cannot be empty.');
            return;
        }
        if (!isAuthenticated || !token) {
            setError('You must be logged in to get AI suggestions.');
            router.push('/login');
            return;
        }

        setLoading(true);
        setError('');
        setSuggestions([]);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/ai/suggest-list`,
                { query },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data && Array.isArray(response.data.items)) {
                setSuggestions(response.data.items);
            } else if (response.data && Array.isArray(response.data.suggestions)) {
                 setSuggestions(response.data.suggestions);
            } else {
                console.warn("AI Suggestion response format is unexpected:", response.data);
                setError("Received an unexpected format for suggestions.");
                setSuggestions([]);
            }
        } catch (err: any) {
            console.error('AI Suggestion error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Failed to get AI suggestions. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 dark:border-blue-300"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-8 border-b border-gray-300 dark:border-gray-700 pb-4">
                    AI Shopping List Suggestions
                </h1>

                <form onSubmit={handleSuggest} className="mb-8">
                    <div className="mb-6">
                        <label htmlFor="aiQuery" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Describe your shopping needs (e.g., "healthy breakfast for a week", "ingredients for lasagna")
                        </label>
                        <textarea
                            id="aiQuery"
                            rows={3}
                            className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            placeholder="e.g., ingredients for a birthday cake and snacks for 10 people"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={!isAuthenticated}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                        disabled={loading || !isAuthenticated || !query.trim()}
                    >
                        {loading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
                    </button>
                </form>

                {!isAuthenticated && !authLoading && (
                    <p className="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50 p-3 rounded-md text-center">
                        Please log in to use AI suggestions.
                    </p>
                )}

                {error && <p className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-6" role="alert">{error}</p>}

                {suggestions.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Suggested Items:</h2>
                        <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md shadow">
                            {suggestions.map((item, index) => (
                                <li key={index} className="text-gray-800 dark:text-gray-200 py-1.5">{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
