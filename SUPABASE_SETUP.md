# Supabase Setup Guide

## 1. Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Project Settings** > **API**
3. Copy the following values:
   - **Project URL**: `https://hkdhjklxawyycprlfwrm.supabase.co` (already added)
   - **anon public key**: Copy this from the "Project API keys" section

## 2. Update Environment Variables

Edit the `client/.env` file and replace `your_supabase_anon_key_here` with your actual anon key:

```env
VITE_SUPABASE_URL=https://hkdhjklxawyycprlfwrm.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## 3. Create Database Tables

Run the following SQL in your Supabase SQL Editor:

### Create Restaurants Table
```sql
CREATE TABLE restaurants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  telephone VARCHAR(50),
  cuisine_type VARCHAR(100),
  rating DECIMAL(2,1),
  delivery_time VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON restaurants
  FOR SELECT USING (true);
```

### Create Menu Items Table
```sql
CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON menu_items
  FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
```

### Create Cart Items Table
```sql
CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own cart
CREATE POLICY "Users can manage their own cart" ON cart_items
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_menu_item ON cart_items(menu_item_id);
```

### Create Orders Table
```sql
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  restaurant_id BIGINT REFERENCES restaurants(id),
  restaurant_name VARCHAR(255),
  restaurant_phone VARCHAR(50),
  restaurant_address TEXT,

  -- Customer details
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,

  -- Order details
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status values: pending, confirmed, preparing, out_for_delivery, delivered, cancelled

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  total DECIMAL(10,2) NOT NULL,

  -- Payment
  payment_method VARCHAR(50) NOT NULL,

  -- Timestamps
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,

  -- Feedback (for delivered orders)
  delivery_condition VARCHAR(50), -- 'good' or 'unsatisfactory'
  restaurant_rating INTEGER CHECK (restaurant_rating >= 1 AND restaurant_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  feedback_comment TEXT,
  feedback_submitted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own orders
CREATE POLICY "Users can manage their own orders" ON orders
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_placed_at ON orders(placed_at DESC);
```

**If you already created the orders table**, run this to add feedback fields:
```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS delivery_condition VARCHAR(50),
  ADD COLUMN IF NOT EXISTS restaurant_rating INTEGER CHECK (restaurant_rating >= 1 AND restaurant_rating <= 5),
  ADD COLUMN IF NOT EXISTS delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  ADD COLUMN IF NOT EXISTS feedback_comment TEXT,
  ADD COLUMN IF NOT EXISTS feedback_submitted_at TIMESTAMP WITH TIME ZONE;
```

### Create Order Items Table
```sql
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id BIGINT REFERENCES menu_items(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Users can view order items" ON order_items
  FOR ALL USING (true);

-- Create index
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

## 4. Insert Sample Data (Optional)

### Sample Restaurant
```sql
INSERT INTO restaurants (name, description, address, telephone, cuisine_type, rating, delivery_time, image_url)
VALUES
  ('Pizza Palace', 'Authentic Italian pizza and pasta', '123 Main St, City', '(555) 123-4567', 'Italian', 4.5, '30-45 min', null),
  ('Sushi Master', 'Fresh sushi and Japanese cuisine', '456 Oak Ave, City', '(555) 234-5678', 'Japanese', 4.8, '25-40 min', null),
  ('Burger House', 'Gourmet burgers and fries', '789 Elm St, City', '(555) 345-6789', 'American', 4.3, '20-30 min', null);
```

### Sample Menu Items
```sql
-- Get the restaurant IDs first
INSERT INTO menu_items (restaurant_id, name, description, price, category)
SELECT r.id, 'Margherita Pizza', 'Classic tomato, mozzarella, and basil', 12.99, 'Pizza'
FROM restaurants r WHERE r.name = 'Pizza Palace'
UNION ALL
SELECT r.id, 'Pepperoni Pizza', 'Tomato sauce, mozzarella, and pepperoni', 14.99, 'Pizza'
FROM restaurants r WHERE r.name = 'Pizza Palace'
UNION ALL
SELECT r.id, 'Caesar Salad', 'Romaine lettuce, croutons, parmesan', 7.99, 'Salads'
FROM restaurants r WHERE r.name = 'Pizza Palace'
UNION ALL
SELECT r.id, 'California Roll', 'Crab, avocado, and cucumber', 8.99, 'Sushi'
FROM restaurants r WHERE r.name = 'Sushi Master'
UNION ALL
SELECT r.id, 'Salmon Nigiri', 'Fresh salmon over rice (2 pieces)', 6.99, 'Sushi'
FROM restaurants r WHERE r.name = 'Sushi Master'
UNION ALL
SELECT r.id, 'Classic Burger', 'Beef patty, lettuce, tomato, cheese', 10.99, 'Burgers'
FROM restaurants r WHERE r.name = 'Burger House'
UNION ALL
SELECT r.id, 'Bacon Cheeseburger', 'Beef patty, bacon, cheese, special sauce', 12.99, 'Burgers'
FROM restaurants r WHERE r.name = 'Burger House';
```

## 5. Start the Development Server

```bash
cd client
npm run dev
```

## 6. Database Schema Overview

### Table Relationships:
- `restaurants` (1) → (many) `menu_items`
- `menu_items` (1) → (many) `cart_items`

### Key Features:
- **Row Level Security (RLS)** is enabled on all tables
- Public read access for restaurants and menu items
- Cart operations are user-specific
- Foreign key constraints ensure data integrity
- Indexes for optimized query performance

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure you've created the `client/.env` file
- Verify the environment variables are correctly named with `VITE_` prefix
- Restart your development server after adding environment variables

### Issue: "relation does not exist"
- Make sure you've run all the SQL commands to create the tables
- Check the table names match exactly (case-sensitive)

### Issue: "permission denied"
- Verify Row Level Security policies are created
- Check that the policies allow the operations you're trying to perform

## 7. Adding Images to Restaurants and Menu Items

Your database already has `image_url` fields for both `restaurants` and `menu_items` tables. Here are two ways to add images:

### Option 1: Use Supabase Storage (Recommended)

1. **Create a Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - Create a new bucket: `restaurant-images`
   - Make it **public** for easy access

2. **Upload Images:**
   - Upload restaurant and menu item photos via the Supabase Dashboard
   - Or use the Supabase client to upload programmatically

3. **Update Database with Image URLs:**
   ```sql
   -- Example: Update restaurant with Supabase Storage URL
   UPDATE restaurants
   SET image_url = 'https://hkdhjklxawyycprlfwrm.supabase.co/storage/v1/object/public/restaurant-images/pizza-palace.jpg'
   WHERE id = 1;

   -- Example: Update menu item with Supabase Storage URL
   UPDATE menu_items
   SET image_url = 'https://hkdhjklxawyycprlfwrm.supabase.co/storage/v1/object/public/restaurant-images/margherita-pizza.jpg'
   WHERE id = 1;
   ```

### Option 2: Use External Image URLs

You can use any publicly accessible image URL:

```sql
-- Example: Update with external URLs
UPDATE restaurants
SET image_url = 'https://example.com/restaurant-photo.jpg'
WHERE name = 'Pizza Palace';

UPDATE menu_items
SET image_url = 'https://example.com/food-photo.jpg'
WHERE name = 'Margherita Pizza';
```

### Image Display

Your app automatically displays images when the `image_url` field is populated:

- **Restaurant Cards**: Shows restaurant image (fallback: 🍽️ emoji)
- **Restaurant Detail Page**: Shows larger restaurant image
- **Menu Items**: Shows food photo for each item (fallback: 🍴 emoji)
- **Shopping Cart**: Shows menu item thumbnails

### Recommended Image Sizes

- **Restaurant Images**: 800x800px (square) or 1200x800px (landscape)
- **Menu Item Images**: 400x400px (square)
- **Format**: JPG or PNG
- **File Size**: Keep under 500KB for faster loading

## Next Steps

1. ✅ Update your `.env` file with the anon key
2. ✅ Run the SQL commands to create tables
3. ✅ (Optional) Insert sample data
4. ✅ Add images to your restaurants and menu items
5. ✅ Test your application
6. Consider adding authentication for real users (currently using USER_ID = 1)
