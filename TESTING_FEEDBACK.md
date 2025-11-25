# Testing Order Feedback Feature

The order feedback feature allows customers to rate their delivered orders and provide feedback on both the restaurant and delivery service.

## Setup

1. **Create the tables** (if not already done):
   ```sql
   -- Run the SQL commands from SUPABASE_SETUP.md to create orders and order_items tables
   ```

2. **Add feedback fields** (if tables already exist):
   ```sql
   ALTER TABLE orders
     ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
     ADD COLUMN IF NOT EXISTS delivery_condition VARCHAR(50),
     ADD COLUMN IF NOT EXISTS restaurant_rating INTEGER CHECK (restaurant_rating >= 1 AND restaurant_rating <= 5),
     ADD COLUMN IF NOT EXISTS delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
     ADD COLUMN IF NOT EXISTS feedback_comment TEXT,
     ADD COLUMN IF NOT EXISTS feedback_submitted_at TIMESTAMP WITH TIME ZONE;
   ```

## Testing the Feedback Feature

### Step 1: Create a Test Order

1. Browse restaurants on your app
2. Add items to cart
3. Complete checkout process
4. Note the Order ID from the Track Order page

### Step 2: Simulate Order Delivery

Go to your Supabase dashboard and run this SQL:

```sql
-- Replace 'YOUR_ORDER_ID' with your actual order ID
UPDATE orders
SET
  status = 'delivered',
  delivered_at = NOW()
WHERE id = 'YOUR_ORDER_ID';
```

### Step 3: Test the Feedback Form

1. Refresh your Track Order page
2. You should see:
   - 🎉 **Order Delivered!** banner with delivery timestamp
   - **"Leave Feedback"** button
3. Click "Leave Feedback" to open the form

### Step 4: Submit Feedback

The feedback form includes:

1. **Delivery Condition** (Required)
   - ✅ Good - Everything arrived perfectly
   - ❌ Unsatisfactory - Issues with the order

2. **Restaurant Rating** (Required)
   - 5-star rating system
   - Ratings: Poor (1★) → Excellent (5★)

3. **Delivery Service Rating** (Required)
   - 5-star rating system
   - Ratings: Poor (1★) → Excellent (5★)

4. **Additional Comments** (Optional)
   - Text area for detailed feedback

### Step 5: View Submitted Feedback

After submission:
- Feedback form is replaced with a summary card
- Shows all ratings and comments
- Displays submission timestamp
- Feedback cannot be edited once submitted

## Features

### For Delivered Orders (No Feedback Yet)
- Green success banner showing delivery time
- "Leave Feedback" button
- Complete feedback form with validation

### For Delivered Orders (Feedback Submitted)
- Blue confirmation card
- Display of all submitted ratings
- Readonly star ratings
- Comments (if provided)
- Submission timestamp

### Validation
- All fields except comments are required
- Rating must be 1-5 stars
- Delivery condition must be selected
- Form submission is disabled during save

## SQL Queries for Testing

### Check Order Status
```sql
SELECT id, status, delivered_at, feedback_submitted_at
FROM orders
WHERE id = 'YOUR_ORDER_ID';
```

### View Feedback
```sql
SELECT
  id,
  status,
  delivery_condition,
  restaurant_rating,
  delivery_rating,
  feedback_comment,
  feedback_submitted_at
FROM orders
WHERE id = 'YOUR_ORDER_ID';
```

### Simulate Different Order Statuses
```sql
-- Pending order
UPDATE orders SET status = 'pending' WHERE id = 'YOUR_ORDER_ID';

-- Confirmed order
UPDATE orders SET status = 'confirmed' WHERE id = 'YOUR_ORDER_ID';

-- Preparing order
UPDATE orders SET status = 'preparing' WHERE id = 'YOUR_ORDER_ID';

-- Out for delivery
UPDATE orders SET status = 'out_for_delivery' WHERE id = 'YOUR_ORDER_ID';

-- Delivered (ready for feedback)
UPDATE orders
SET status = 'delivered', delivered_at = NOW()
WHERE id = 'YOUR_ORDER_ID';

-- Cancelled
UPDATE orders
SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = 'Customer request'
WHERE id = 'YOUR_ORDER_ID';
```

### Reset Feedback (for testing multiple submissions)
```sql
UPDATE orders
SET
  delivery_condition = NULL,
  restaurant_rating = NULL,
  delivery_rating = NULL,
  feedback_comment = NULL,
  feedback_submitted_at = NULL
WHERE id = 'YOUR_ORDER_ID';
```

## UI Components

### Star Rating Component
- Interactive 5-star rating system
- Hover effects when editable
- Readonly mode for displaying submitted ratings
- Visual feedback with filled (⭐) and empty (☆) stars

### Delivery Condition Selector
- Radio buttons with visual feedback
- Green border/background for "Good"
- Red border/background for "Unsatisfactory"
- Clear icons (✅/❌) for quick understanding

### Feedback Display
- Formatted in an attractive card layout
- Color-coded by status (green for delivered, blue for feedback submitted)
- All timestamps formatted consistently
- Responsive design for mobile and desktop
