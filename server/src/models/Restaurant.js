const pool = require('../config/database');

class Restaurant {
  // Get all restaurants
  static async findAll() {
    const query = 'SELECT * FROM restaurants WHERE is_active = true ORDER BY rating DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get restaurant by ID
  static async findById(id) {
    const query = 'SELECT * FROM restaurants WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get menu items for a restaurant
  static async getMenuItems(restaurantId) {
    const query = `
      SELECT * FROM menu_items 
      WHERE restaurant_id = $1 AND is_available = true
      ORDER BY category, name
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows;
  }
}

module.exports = Restaurant;
