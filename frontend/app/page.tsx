'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
  const [lists, setLists] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [listName, setListName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchLists();
      fetchSharedLists();
    }
  }, []);

  const refreshToken = async () => {
    console.log('Trying to refresh token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/refresh-token`, {}, {
        headers: { 'x-refresh-token': refreshToken },
      });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem('token', newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error('Refresh token error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      throw new Error('Failed to refresh token');
    }
  };

  const fetchLists = async () => {
    console.log('Fetching lists with token');
    try {
      let token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLists(response.data);
      } catch (err) {
        if (err.response?.data?.error === 'Invalid token' || err.message.includes('expired')) {
          token = await refreshToken();
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/lists`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLists(response.data);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Fetch lists error:', err);
      setError('Failed to load lists');
    }
  };

  const fetchSharedLists = async () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/shared/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSharedLists(response.data);
      } catch (err) {
        if (err.response?.data?.error === 'Invalid token' || err.message.includes('expired')) {
          token = await refreshToken();
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/shared/lists`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSharedLists(response.data);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Fetch shared lists error:', err);
      setError('Failed to load shared lists');
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listName.trim()) {
      setError('List name cannot be empty');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lists`,
          { name: listName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLists([...lists, { uuid: response.data.uuid, name: listName }]);
        setListName('');
      } catch (err) {
        if (err.response?.data?.error === 'Invalid token' || err.message.includes('expired')) {
          token = await refreshToken();
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/lists`,
            { name: listName },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setLists([...lists, { uuid: response.data.uuid, name: listName }]);
          setListName('');
        } else {
          throw err;
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create list';
      setError(errorMessage);
      console.error('Create list error:', err.response || err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setLists([]);
    setSharedLists([]);
  };

  if (!isAuthenticated) {
    return (
      <section className="py-20 bg-white">
        <div className="container">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Welcome to ShopSmart
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Please log in or register to start creating shopping lists.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Your Shopping Lists</h1>
        </div>
        <form onSubmit={handleCreateList} className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create New List'}
          </button>
        </form>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Lists</h2>
        {lists.length === 0 ? (
          <p className="text-gray-600">No lists yet. Create one to get started!</p>
        ) : (
          <ul className="space-y-4 mb-8">
            {lists.map((list) => (
              <li key={list.uuid} className="bg-gray-50 p-4 rounded-lg shadow">
                <Link href={`/list/${list.uuid}`}>
                  <span className="text-primary hover:underline">{list.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Shared Lists</h2>
        {sharedLists.length === 0 ? (
          <p className="text-gray-600">No shared lists yet.</p>
        ) : (
          <ul className="space-y-4">
            {sharedLists.map((list) => (
              <li key={list.uuid} className="bg-gray-50 p-4 rounded-lg shadow">
                <Link href={`/list/${list.uuid}`}>
                  <span className="text-primary hover:underline">{list.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}