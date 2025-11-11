const Restaurant = require('../models/Restaurant');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurants'
    });
  }
};

// Get single restaurant
exports.getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant'
    });
  }
};

// Get restaurant menu
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItems = await Restaurant.getMenuItems(id);
    
    res.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu'
    });
  }
};
