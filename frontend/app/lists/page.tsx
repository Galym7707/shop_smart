'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function MyLists() {
  const [lists, setLists] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/lists`, // Corrected endpoint
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLists(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to load lists';
        setError(errorMessage);
        console.error('Fetch lists error:', err.response || err);
      }
      setLoading(false);
    };

    fetchLists();
  }, []);

  const handleCreateList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lists`,
        { name: `New List ${new Date().toISOString()}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/list/${response.data.uuid}`);
    } catch (err) {
      setError('Failed to create list');
      console.error('Create list error:', err.response || err);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container">
          <p className="text-center text-gray-600">Loading lists...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Lists</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {lists.length === 0 ? (
          <p className="text-gray-600">No lists found. Create one to get started!</p>
        ) : (
          <ul className="space-y-4">
            {lists.map((list) => (
              <li
                key={list.uuid}
                className="bg-gray-50 p-4 rounded-lg shadow hover:bg-gray-100 transition duration-300"
                onClick={() => router.push(`/list/${list.uuid}`)}
              >
                {list.name || `List ${list.uuid.slice(0, 8)}...`}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleCreateList}
          className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
        >
          Create New List
        </button>
      </div>
    </section>
  );
}