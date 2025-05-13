const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const ShoppingList = require('../models/ShoppingList');
const User = require('../models/User');
const { suggestItems } = require('../services/gemini');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log('Register route called with body:', req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Creating new user...');
    const user = new User({ name, email, password: hashedPassword });
    console.log('Saving user to database...');
    await user.save();
    console.log('Generating JWT...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('User registered successfully:', email);
    res.status(201).json({ token, user: { name, email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    console.log('Login route called with body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ error: 'Email and password are required' });
    }
    console.log('Finding user...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    console.log('Generating JWT...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('User logged in successfully:', email);
    res.json({ token, user: { name: user.name, email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'API routes are working' });
});

// Get a specific list
router.get('/lists/:uuid', verifyToken, async (req, res) => {
  try {
    console.log('Fetching list for user:', req.userId, 'with uuid:', req.params.uuid);
    const list = await ShoppingList.findOne({ uuid: req.params.uuid });
    if (!list) return res.status(404).json({ error: 'List not found' });

    if (list.owner.toString() !== req.userId && !list.collaborators.includes(req.userId)) {
      return res.status(403).json({ error: 'You do not have permission to view this list' });
    }

    res.json(list);
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new list
router.post('/lists', verifyToken, async (req, res) => {
  try {
    console.log('Create list route called for user:', req.userId);
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required' });
    }
    const uuid = uuidv4();
    const list = new ShoppingList({ uuid, name, owner: req.userId, items: [], collaborators: [] });
    await list.save();
    console.log('List created successfully:', uuid);
    res.status(201).json({ uuid, name });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update list name
router.patch('/lists/:uuid', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required' });
    }
    const list = await ShoppingList.findOne({ uuid: req.params.uuid });
    if (!list) return res.status(404).json({ error: 'List not found' });
    if (list.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can edit the list name' });
    }

    list.name = name;
    await list.save();
    req.app.get('io').to(req.params.uuid).emit('listUpdate', list);
    res.json(list);
  } catch (error) {
    console.error('Update list name error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to list
router.post('/lists/:uuid/items', verifyToken, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Item name cannot be empty' });
    }
    const list = await ShoppingList.findOne({ uuid: req.params.uuid });
    if (!list) return res.status(404).json({ error: 'List not found' });

    if (list.owner.toString() !== req.userId && !list.collaborators.includes(req.userId)) {
      return res.status(403).json({ error: 'You do not have permission to edit this list' });
    }

    if (!list.name) {
      list.name = 'Unnamed List';
    }

    list.items.push({ name, category: category || 'Groceries' });
    await list.save();
    req.app.get('io').to(req.params.uuid).emit('listUpdate', list);
    res.status(201).json(list);
  } catch (error) {
    console.error('Add item error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed: ' + error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle item (mark as bought)
router.patch('/lists/:uuid/items/:itemId', verifyToken, async (req, res) => {
  try {
    const { bought } = req.body;
    const list = await ShoppingList.findOne({ uuid: req.params.uuid });
    if (!list) return res.status(404).json({ error: 'List not found' });

    if (list.owner.toString() !== req.userId && !list.collaborators.includes(req.userId)) {
      return res.status(403).json({ error: 'You do not have permission to edit this list' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (!list.name) {
      list.name = 'Unnamed List';
    }

    item.bought = bought;
    await list.save();
    req.app.get('io').to(req.params.uuid).emit('listUpdate', list);
    res.json(list);
  } catch (error) {
    console.error('Toggle item error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed: ' + error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a list
router.delete('/lists/:uuid', verifyToken, async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ uuid: req.params.uuid });
    if (!list) return res.status(404).json({ error: 'List not found' });

    if (list.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can delete the list' });
    }

    await ShoppingList.deleteOne({ uuid: req.params.uuid });
    req.app.get('io').to(req.params.uuid).emit('listDeleted', { uuid: req.params.uuid });
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an item from a list
router.delete('/lists/:uuid/items/:itemId', verifyToken, async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ uuid: req.params.uuid });
    if (!list) return res.status(404).json({ error: 'List not found' });

    if (list.owner.toString() !== req.userId && !list.collaborators.includes(req.userId)) {
      return res.status(403).json({ error: 'You do not have permission to edit this list' });
    }

    if (!list.name) {
      list.name = 'Unnamed List';
    }

    list.items.pull(req.params.itemId);
    await list.save();
    req.app.get('io').to(req.params.uuid).emit('listUpdate', list);
    res.json(list);
  } catch (error) {
    console.error('Delete item error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed: ' + error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's own lists
router.get('/user/lists', verifyToken, async (req, res) => {
  try {
    console.log('Fetching lists for user:', req.userId);
    const lists = await ShoppingList.find({ owner: req.userId });
    res.json(lists);
  } catch (error) {
    console.error('Get user lists error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invite a collaborator
router.post('/lists/:uuid/invite', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const list = await ShoppingList.findOne({ uuid: req.params.uuid });
    if (!list) return res.status(404).json({ error: 'List not found' });
    if (list.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can invite collaborators' });
    }
    if (list.collaborators.includes(user._id)) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    if (!list.name) {
      list.name = 'Unnamed List';
    }

    list.collaborators.push(user._id);
    await list.save();
    req.app.get('io').to(req.params.uuid).emit('listUpdate', list);
    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Invite collaborator error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed: ' + error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shared lists
router.get('/shared/lists', verifyToken, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ collaborators: req.userId });
    res.json(lists);
  } catch (error) {
    console.error('Get shared lists error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI suggestion endpoint
router.post('/ai-suggest', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query cannot be empty' });
    }
    const suggestions = await suggestItems(query);
    res.json({ suggestions });
  } catch (error) {
    console.error('AI suggest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;