'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Fetch profile error:', err);
      }
    };
    fetchUser();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Profile</h1>
        <div className="max-w-md mx-auto">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
    </section>
  );
}