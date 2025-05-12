'use client';
import { useState } from 'react';
import axios from 'axios';

export function AISuggestForm() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai-suggest`, {
        query,
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError('Failed to generate suggestions');
    }
    setLoading(false);
  };

  return (
    <section className="py-20">
      <div className="container">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          AI Shopping Suggestions
        </h2>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., 'products for borscht'"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Get Suggestions'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
        {suggestions.length > 0 && (
          <div className="max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Suggested Items</h3>
            <ul className="space-y-4">
              {suggestions.map((item, index) => (
                <li key={index} className="p-4 bg-gray-50 rounded-lg shadow">
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