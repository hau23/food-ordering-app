-- Add delivery_time column to restaurants table
ALTER TABLE restaurants ADD COLUMN delivery_time VARCHAR(20);

-- Optionally, update existing restaurants with default delivery times
UPDATE restaurants SET delivery_time = '30-45 mins' WHERE delivery_time IS NULL;
