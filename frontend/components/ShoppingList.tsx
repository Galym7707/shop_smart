'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

export function ShoppingList({ uuid }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    socket.emit('joinList', uuid);

    // Fetch initial list
    const fetchList = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lists/${uuid}`);
        setItems(response.data.items);
        setLoading(false);
      } catch (err) {
        setError('Failed to load list');
        setLoading(false);
      }
    };
    fetchList();

    // Listen for real-time updates
    socket.on('listUpdate', (updatedList) => {
      setItems(updatedList.items);
    });

    return () => {
      socket.disconnect();
    };
  }, [uuid]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) {
      setError('Item name cannot be empty');
      return;
    }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/lists/${uuid}/items`, {
        name: newItem,
      });
      setNewItem('');
      setError('');
    } catch (err) {
      setError('Failed to add item');
    }
  };

  const toggleBought = async (itemId) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/lists/${uuid}/items/${itemId}`, {
        bought: !items.find((item) => item._id === itemId).bought,
      });
    } catch (err) {
      setError('Failed to update item');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/lists/${uuid}/items/${itemId}`);
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error && !items.length) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <section className="py-20">
      <div className="container">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Shopping List
        </h2>
        <form onSubmit={addItem} className="max-w-lg mx-auto mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add item..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
        <div className="max-w-lg mx-auto">
          {items.length === 0 ? (
            <p className="text-gray-600 text-center">No items in the list.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item._id}
                  className={`flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow ${
                    item.bought ? 'opacity-50 line-through' : ''
                  }`}
                >
                  <span>{item.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBought(item._id)}
                      className="text-secondary hover:text-green-600"
                    >
                      {item.bought ? 'Unmark' : 'Mark Bought'}
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-center mt-8 text-gray-600">
          Share this list: <code>{`${window.location.origin}/list/${uuid}`}</code>
        </p>
      </div>
    </section>
  );
}