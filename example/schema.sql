-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into users
INSERT INTO users (username, email) VALUES
('john_doe', 'john@example.com'),
('jane_smith', 'jane@example.com'),
('mike_taylor', 'mike@example.com'),
('alice_brown', 'alice@example.com'),
('bob_williams', 'bob@example.com'),
('charlie_jones', 'charlie@example.com'),
('david_clark', 'david@example.com'),
('emily_davis', 'emily@example.com'),
('frank_moore', 'frank@example.com'),
('george_white', 'george@example.com');

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into products
INSERT INTO products (name, description, price) VALUES
('Laptop', 'A high-end gaming laptop with 16GB RAM and 512GB SSD', 1200.00),
('Smartphone', 'A smartphone with 5G support and 128GB storage', 800.00),
('Tablet', 'A lightweight tablet with a 10-inch screen', 350.00),
('Smartwatch', 'A smartwatch with health monitoring features', 150.00),
('Headphones', 'Wireless over-ear headphones with noise cancellation', 250.00),
('Keyboard', 'Mechanical keyboard with RGB lighting', 100.00),
('Mouse', 'Wireless gaming mouse with high DPI', 50.00),
('Camera', 'Digital camera with 4K video recording', 500.00),
('Monitor', '24-inch 1080p monitor with IPS panel', 200.00),
('Speaker', 'Bluetooth speaker with great bass and long battery life', 75.00);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample data into orders
INSERT INTO orders (user_id, product_id, quantity) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
(6, 6, 1),
(7, 7, 2),
(8, 8, 1),
(9, 9, 1),
(10, 10, 3),
(1, 5, 2),
(2, 6, 1),
(3, 7, 1),
(4, 8, 2);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Insert sample data into categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Devices and gadgets like phones, laptops, and tablets'),
('Wearables', 'Smartwatches, fitness trackers, and other wearable devices'),
('Home Appliances', 'Appliances for home use like fridges, microwaves, etc.'),
('Accessories', 'Tech accessories like headphones, keyboards, and mouses'),
('Entertainment', 'Devices for entertainment like cameras, speakers, and monitors');

-- Product Categories Table
CREATE TABLE product_categories (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    PRIMARY KEY (product_id, category_id)
);

-- Insert sample data for product categories
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 2),
(5, 4),
(6, 4),
(7, 4),
(8, 1),
(9, 1),
(10, 5),
(1, 4),
(5, 2),
(3, 5),
(8, 5);
