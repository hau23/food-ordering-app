const Cart = require('../models/Cart');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    // For now, using a temporary user ID (userId = 1)
    // In production, you'd get this from authentication middleware
    const userId = req.query.userId || 1;

    const cart = await Cart.getCartWithItems(userId);

    if (!cart) {
      return res.json({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    // For now, using a temporary user ID (userId = 1)
    const userId = req.body.userId || 1;
    const { menuItemId, restaurantId, quantity } = req.body;

    if (!menuItemId || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Menu item ID and restaurant ID are required'
      });
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(userId, restaurantId);

    // Add item to cart
    await Cart.addItem(cart.id, menuItemId, quantity || 1);

    // Get updated cart with items
    const updatedCart = await Cart.getCartWithItems(userId);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.body.userId || 1;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    await Cart.updateItemQuantity(parseInt(cartItemId), parseInt(quantity));

    // Get updated cart
    const updatedCart = await Cart.getCartWithItems(userId);

    res.json({
      success: true,
      message: 'Cart item updated',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.query.userId || 1;

    await Cart.removeItem(parseInt(cartItemId));

    // Get updated cart
    const updatedCart = await Cart.getCartWithItems(userId);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.query.userId || 1;

    // First get the cart
    const cart = await Cart.getCartWithItems(userId);

    if (cart) {
      await Cart.clearCart(cart.id);
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        total: 0
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};
