const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Groceries' },
  bought: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const shoppingListSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  items: [itemSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);