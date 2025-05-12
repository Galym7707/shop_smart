async function suggestItems(query) {
    try {
      // Mock data based on query
      if (query.toLowerCase().includes('borscht')) {
        return ['Beets', 'Cabbage', 'Potatoes', 'Carrots', 'Beef', 'Onions', 'Tomato Paste'];
      } else if (query.toLowerCase().includes('electronics')) {
        return ['Laptop', 'Headphones', 'Smartphone', 'Charger', 'Mouse'];
      } else if (query.toLowerCase().includes('household')) {
        return ['Detergent', 'Dish Soap', 'Paper Towels', 'Trash Bags', 'Sponges'];
      }
      // Default mock data for general queries
      return ['Milk', 'Bread', 'Eggs', 'Cheese', 'Apples', 'Chicken'];
    } catch (error) {
      console.error('Mock suggestion error:', error);
      return ['Error generating suggestions'];
    }
  }
  
  module.exports = { suggestItems };