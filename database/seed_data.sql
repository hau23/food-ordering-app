-- Insert sample users
INSERT INTO users (name, email, password, phone, address, role) VALUES
('John Doe', 'john@example.com', '$2a$10$hashedpassword', '1234567890', '123 Main St', 'customer'),
('Pizza Owner', 'pizza@restaurant.com', '$2a$10$hashedpassword', '0987654321', '456 Business Ave', 'restaurant_owner'),
('Admin User', 'admin@foodapp.com', '$2a$10$hashedpassword', '1112223333', '789 Admin Rd', 'admin');

-- Insert sample restaurants
INSERT INTO restaurants (owner_id, name, description, address, telephone, cuisine_type, rating, delivery_time) VALUES
(2, 'Pizza Palace', 'Best pizza in town!', '100 Pizza Street', '2899 5322', 'Italian', 4.5, '30-45 mins'),
(2, 'Burger Heaven', 'Juicy burgers made fresh', '200 Burger Lane', '3456 1234', 'American', 4.2, '30-45 mins');

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available) VALUES
(1, 'Margherita Pizza', 'Classic tomato and mozzarella', 12.99, 'main', true),
(1, 'Pepperoni Pizza', 'Loaded with pepperoni', 14.99, 'main', true),
(1, 'Caesar Salad', 'Fresh romaine with Caesar dressing', 7.99, 'appetizer', true),
(2, 'Classic Burger', 'Beef patty with lettuce and tomato', 9.99, 'main', true),
(2, 'Cheese Fries', 'Crispy fries with melted cheese', 5.99, 'appetizer', true);