ALTER TABLE restaurants ADD COLUMN image_url VARCHAR(255);

UPDATE restaurants SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop'
WHERE name = 'Pizza Palace';

UPDATE restaurants SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop' 
WHERE name = 'Burger Heaven';
