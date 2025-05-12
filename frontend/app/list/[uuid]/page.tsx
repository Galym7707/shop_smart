'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';

export default function ListPage() {
  const { uuid } = useParams();
  const router = useRouter();
  const [list, setList] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newListName, setNewListName] = useState('');

  const categories = ['Groceries', 'Household', 'Electronics', 'Clothing', 'Other'];

  useEffect(() => {
    const fetchList = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/lists/${uuid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setList(response.data);
        setNewListName(response.data.name || `List ${uuid.slice(0, 8)}...`);
      } catch (err) {
        setError('Failed to load list');
        console.error('Fetch list error:', err.response || err);
      }
      setLoading(false);
    };

    fetchList();

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL);
    socketInstance.emit('joinList', uuid);
    socketInstance.on('listUpdate', (updatedList) => {
      setList(updatedList);
      setNewListName(updatedList.name || `List ${uuid.slice(0, 8)}...`);
    });
    socketInstance.on('listDeleted', (data) => {
      if (data.uuid === uuid) {
        router.push('/lists'); // Redirect to My Lists page when list is deleted
      }
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [uuid, router]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) {
      setError('Item name cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lists/${uuid}/items`,
        { name: newItem, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(response.data);
      setNewItem('');
      setCategory('Groceries');
      setError('');
    } catch (err) {
      setError('Failed to add item');
      console.error('Add item error:', err.response || err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setError('Email cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lists/${uuid}/invite`,
        { email: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message);
      setInviteEmail('');
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to invite collaborator';
      setError(errorMessage);
      console.error('Invite error:', err.response || err);
    }
  };

  const handleToggleBought = async (itemId, bought) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lists/${uuid}/items/${itemId}`,
        { bought: !bought },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(response.data);
    } catch (err) {
      setError('Failed to update item');
      console.error('Toggle item error:', err.response || err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lists/${uuid}/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(response.data);
    } catch (err) {
      setError('Failed to delete item');
      console.error('Delete item error:', err.response || err);
    }
  };

  const handleEditName = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setError('List name cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lists/${uuid}`,
        { name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(response.data);
      setIsEditingName(false);
      setError('');
    } catch (err) {
      setError('Failed to update list name');
      console.error('Edit name error:', err.response || err);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/lists/${uuid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Redirect handled by socket 'listDeleted' event
    } catch (err) {
      setError('Failed to delete list');
      console.error('Delete list error:', err.response || err);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container">
          <p className="text-center text-gray-600">Loading list...</p>
        </div>
      </section>
    );
  }

  if (!list) {
    return (
      <section className="py-20 bg-white">
        <div className="container">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = list.items.filter((item) => item.category === cat);
    return acc;
  }, {});

  return (
    <section className="py-20 bg-white">
      <div className="container">
        {isEditingName ? (
          <form onSubmit={handleEditName} className="mb-8 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingName(false)}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="mb-8 flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800">
              {list.name || `List ${uuid.slice(0, 8)}...`}
            </h1>
            <button
              onClick={() => setIsEditingName(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition duration-300"
            >
              Edit Name
            </button>
            <button
              onClick={handleDeleteList}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
            >
              Delete List
            </button>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Invite Collaborators</h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter collaborator's email"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              Invite
            </button>
          </form>
          {success && <p className="text-green-500 mt-4">{success}</p>}
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleAddItem} className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add new item"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition duration-300"
          >
            Add Item
          </button>
        </form>
        {list.items.length === 0 ? (
          <p className="text-gray-600">No items in this list. Add some to get started!</p>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              groupedItems[cat]?.length > 0 && (
                <div key={cat}>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">{cat}</h2>
                  <ul className="space-y-4">
                    {groupedItems[cat].map((item) => (
                      <li
                        key={item._id}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.bought}
                            onChange={() => handleToggleBought(item._id, item.bought)}
                            className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span
                            className={`ml-3 text-lg ${
                              item.bought ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-red-500 hover:text-red-700 transition duration-300"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </section>
  );
}