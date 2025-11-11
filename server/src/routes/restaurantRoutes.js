const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// GET /api/restaurants - Get all restaurants
router.get('/', restaurantController.getAllRestaurants);

// GET /api/restaurants/:id - Get single restaurant
router.get('/:id', restaurantController.getRestaurant);

// GET /api/restaurants/:id/menu - Get restaurant menu
router.get('/:id/menu', restaurantController.getRestaurantMenu);

module.exports = router;
