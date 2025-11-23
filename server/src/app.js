const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const restaurantRoutes = require('./routes/restaurantRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Test database connection
const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Food Ordering API is running!' });
});

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart', cartRoutes);

module.exports = app;
