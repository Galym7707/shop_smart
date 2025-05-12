'use client';
import { useState } from 'react';
import axios from 'axios';

export default function AISuggest() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuggest = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Query cannot be empty');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai-suggest`, // Corrected endpoint
        { query },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuggestions(response.data.suggestions);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to generate suggestions';
      setError(errorMessage);
      console.error('AI suggest error:', err.response || err);
    }
    setLoading(false);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">AI Shopping Suggestions</h1>
        <form onSubmit={handleSuggest} className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query (e.g., products for borscht)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Get Suggestions'}
          </button>
        </form>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {suggestions.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Suggestions:</h2>
            <ul className="space-y-2">
              {suggestions.map((item, index) => (
                <li key={index} className="bg-gray-50 p-3 rounded-lg shadow">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}