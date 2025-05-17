// frontend/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: string;
    username: string; // Или name, в зависимости от твоей модели User
    email: string;
    // Добавь другие поля пользователя, которые хочешь отображать
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userId: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (storedToken && userId) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            fetchUserProfile(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (currentToken: string) => {
        try {
            const res = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            setUser(res.data);
        } catch (error) {
            console.error('Failed to fetch user profile', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (newToken: string, userId: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', userId);
        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await fetchUserProfile(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        // Опционально: перенаправление на страницу логина
        // window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token && !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
