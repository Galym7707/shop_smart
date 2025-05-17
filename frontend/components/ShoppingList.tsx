// frontend/components/ShoppingList.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Изменено с @/context/AuthContext
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ShoppingListItem {
    _id: string;
    name: string;
    bought: boolean;
}

interface ShoppingListProps {
    uuid: string;
}

export default function ShoppingList({ uuid }: ShoppingListProps) {
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [listTitle, setListTitle] = useState<string>('Shopping List');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            // Логика перенаправления, если список приватный
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!uuid) return;

        const socketUrl = API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';
        const socket: Socket = io(socketUrl);

        socket.emit('joinList', uuid);

        const fetchList = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/lists/${uuid}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setItems(response.data.items || []);
                setListTitle(response.data.name || `List ${uuid.substring(0,6)}...`);
                setError('');
            } catch (err: any) {
                console.error('Failed to load list:', err);
                setError(err.response?.data?.message || 'Failed to load list.');
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchList();

        socket.on('listUpdate', (updatedListData: { name?: string, items: ShoppingListItem[] }) => {
            setItems(updatedListData.items || []);
            if(updatedListData.name) setListTitle(updatedListData.name);
        });
        
        socket.on('itemAdded', (addedItem: ShoppingListItem) => {
            setItems(prevItems => [...prevItems, addedItem]);
        });

        socket.on('itemUpdated', (updatedItem: ShoppingListItem) => {
            setItems(prevItems => prevItems.map(item => item._id === updatedItem._id ? updatedItem : item));
        });

        socket.on('itemDeleted', (deletedItemId: string) => {
            setItems(prevItems => prevItems.filter(item => item._id !== deletedItemId));
        });
        
        socket.on('connect_error', (err) => {
            console.error("Socket connection error:", err.message);
            setError("Failed to connect to real-time updates.");
        });

        return () => {
            socket.disconnect();
        };
    }, [uuid, token, API_BASE_URL]); // Добавил API_BASE_URL в зависимости

    const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newItemName.trim()) {
            setError('Item name cannot be empty');
            return;
        }
        if (!isAuthenticated) {
            setError('Please log in to add items.');
            return;
        }
        try {
            await axios.post(
                `${API_BASE_URL}/api/lists/${uuid}/items`,
                { name: newItemName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewItemName('');
            setError('');
        } catch (err: any) {
            console.error('Failed to add item:', err);
            setError(err.response?.data?.message || 'Failed to add item.');
        }
    };

    const handleToggleBought = async (itemId: string) => {
        if (!isAuthenticated) {
            setError('Please log in to update items.');
            return;
        }
        const itemToUpdate = items.find((item) => item._id === itemId);
        if (!itemToUpdate) return;

        try {
            await axios.patch(
                `${API_BASE_URL}/api/lists/${uuid}/items/${itemId}`,
                { bought: !itemToUpdate.bought },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err: any) {
            console.error('Failed to update item:', err);
            setError(err.response?.data?.message || 'Failed to update item.');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!isAuthenticated) {
            setError('Please log in to delete items.');
            return;
        }
        try {
            await axios.delete(
                `${API_BASE_URL}/api/lists/${uuid}/items/${itemId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err: any) {
            console.error('Failed to delete item:', err);
            setError(err.response?.data?.message || 'Failed to delete item.');
        }
    };

    if (loading && authLoading) { // Учитываем обе загрузки
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-400px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 dark:border-blue-300"></div>
                <p className="ml-4 text-lg text-gray-600 dark:text-gray-400">Loading list...</p>
            </div>
        );
    }

    return (
        <section className="py-10 md:py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">
                    {listTitle}
                </h2>

                {isAuthenticated && (
                    <form onSubmit={handleAddItem} className="max-w-xl mx-auto mb-8">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Add new item..."
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300"
                            >
                                Add Item
                            </button>
                        </div>
                    </form>
                )}
                
                {error && <p className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-6 text-center max-w-xl mx-auto" role="alert">{error}</p>}

                <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    {items.length === 0 && !loading ? (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-6">This shopping list is empty. Add some items!</p>
                    ) : (
                        <ul className="space-y-3">
                            {items.map((item) => (
                                <li
                                    key={item._id}
                                    className={`flex justify-between items-center p-3 rounded-md transition-all duration-200 ease-in-out group
                                        ${item.bought 
                                            ? 'bg-green-50 dark:bg-green-900/30 opacity-70' 
                                            : 'bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span 
                                        className={`flex-1 cursor-pointer ${item.bought ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}
                                        onClick={() => isAuthenticated && handleToggleBought(item._id)}
                                    >
                                        {item.name}
                                    </span>
                                    {isAuthenticated && (
                                        <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleToggleBought(item._id)}
                                                title={item.bought ? 'Mark as not bought' : 'Mark as bought'}
                                                className={`p-1.5 rounded-full transition-colors 
                                                    ${item.bought 
                                                        ? 'text-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-700' 
                                                        : 'text-green-600 hover:bg-green-200 dark:hover:bg-green-700'
                                                    }`}
                                            >
                                                {item.bought ? '↩️' : '✔️'} 
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item._id)}
                                                title="Delete item"
                                                className="text-red-500 hover:bg-red-200 dark:hover:bg-red-700 p-1.5 rounded-full transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {uuid && (
                    <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                        Share this list: <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">{typeof window !== 'undefined' ? `${window.location.origin}/list/${uuid}` : `/list/${uuid}`}</code>
                    </p>
                )}
            </div>
        </section>
    );
}
