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

  if (error) {
    return (
      <section className="py-20">
        <div className="container">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="py-20">
        <div className="container">
          <p className="text-center">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container">
        <h1 className="text-4xl text-center mb-12">Your Profile</h1>
        <div className="card max-w-md mx-auto">
          <p className="text-lg mb-4">Nickname: {user.name}</p>
          <p className="text-lg">Email: {user.email}</p>
        </div>
      </div>
    </section>
  );
}