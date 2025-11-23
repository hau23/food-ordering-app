const pool = require('../config/database');

class Cart {
  // Get or create cart for user
  static async getOrCreateCart(userId, restaurantId) {
    // First, check if user has an existing cart
    let cartQuery = 'SELECT * FROM carts WHERE user_id = $1';
    let result = await pool.query(cartQuery, [userId]);

    if (result.rows.length > 0) {
      const existingCart = result.rows[0];

      // If cart exists but for different restaurant, clear it
      if (existingCart.restaurant_id !== restaurantId) {
        await this.clearCart(existingCart.id);
        // Update restaurant_id
        const updateQuery = `
          UPDATE carts
          SET restaurant_id = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;
        result = await pool.query(updateQuery, [restaurantId, existingCart.id]);
        return result.rows[0];
      }

      return existingCart;
    }

    // Create new cart
    const createQuery = `
      INSERT INTO carts (user_id, restaurant_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    result = await pool.query(createQuery, [userId, restaurantId]);
    return result.rows[0];
  }

  // Get cart with items and menu details
  static async getCartWithItems(userId) {
    const query = `
      SELECT
        c.id as cart_id,
        c.restaurant_id,
        r.name as restaurant_name,
        ci.id as cart_item_id,
        ci.quantity,
        mi.id as menu_item_id,
        mi.name as item_name,
        mi.description,
        mi.price,
        mi.image_url,
        (ci.quantity * mi.price) as subtotal
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN menu_items mi ON ci.menu_item_id = mi.id
      LEFT JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.user_id = $1
      ORDER BY ci.created_at DESC
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0 || !result.rows[0].cart_id) {
      return null;
    }

    // Format the response
    const cart = {
      id: result.rows[0].cart_id,
      restaurant_id: result.rows[0].restaurant_id,
      restaurant_name: result.rows[0].restaurant_name,
      items: result.rows
        .filter(row => row.cart_item_id !== null)
        .map(row => ({
          cart_item_id: row.cart_item_id,
          menu_item_id: row.menu_item_id,
          name: row.item_name,
          description: row.description,
          price: parseFloat(row.price),
          image_url: row.image_url,
          quantity: row.quantity,
          subtotal: parseFloat(row.subtotal)
        })),
      total: result.rows
        .filter(row => row.subtotal !== null)
        .reduce((sum, row) => sum + parseFloat(row.subtotal), 0)
    };

    return cart;
  }

  // Add item to cart
  static async addItem(cartId, menuItemId, quantity = 1) {
    // Check if item already exists in cart
    const checkQuery = 'SELECT * FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2';
    const checkResult = await pool.query(checkQuery, [cartId, menuItemId]);

    if (checkResult.rows.length > 0) {
      // Update quantity
      const updateQuery = `
        UPDATE cart_items
        SET quantity = quantity + $1
        WHERE cart_id = $2 AND menu_item_id = $3
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [quantity, cartId, menuItemId]);

      // Update cart's updated_at
      await pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);

      return result.rows[0];
    }

    // Insert new item
    const insertQuery = `
      INSERT INTO cart_items (cart_id, menu_item_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [cartId, menuItemId, quantity]);

    // Update cart's updated_at
    await pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);

    return result.rows[0];
  }

  // Update item quantity
  static async updateItemQuantity(cartItemId, quantity) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return await this.removeItem(cartItemId);
    }

    const query = `
      UPDATE cart_items
      SET quantity = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [quantity, cartItemId]);

    if (result.rows.length > 0) {
      // Update cart's updated_at
      const cartId = result.rows[0].cart_id;
      await pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);
    }

    return result.rows[0];
  }

  // Remove item from cart
  static async removeItem(cartItemId) {
    const query = 'DELETE FROM cart_items WHERE id = $1 RETURNING cart_id';
    const result = await pool.query(query, [cartItemId]);

    if (result.rows.length > 0) {
      // Update cart's updated_at
      const cartId = result.rows[0].cart_id;
      await pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);
    }

    return result.rows[0];
  }

  // Clear all items from cart
  static async clearCart(cartId) {
    const query = 'DELETE FROM cart_items WHERE cart_id = $1';
    await pool.query(query, [cartId]);

    // Update cart's updated_at
    await pool.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId]);
  }

  // Delete cart entirely
  static async deleteCart(userId) {
    const query = 'DELETE FROM carts WHERE user_id = $1';
    await pool.query(query, [userId]);
  }
}

module.exports = Cart;
