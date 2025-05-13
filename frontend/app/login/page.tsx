'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
      const loginUrl = `${apiUrl}/api/login`;
      console.log('Attempting login at:', loginUrl);
      const response = await axios.post(loginUrl, formData);
      localStorage.setItem('token', response.data.token);
      setSuccess('Login successful! Redirecting...');
      router.push('/');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    }
    setLoading(false);
  };

  return (
    <section className="py-20 bg-white">
      <div class="container">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Login</h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-gray-50 p-8 rounded-xl shadow-lg"
        >
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="mt-4 text-center text-gray-600">
            Don’t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}