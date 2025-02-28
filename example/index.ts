import 'dotenv/config';
import { ormGPT } from "../src";
import axios from 'axios';  // Import axios for making API calls to Hugging Face

(async () => {
  const ormgpt = new ormGPT({
    apiKey: process.env.HUGGING_FACE_API_KEY || " ",  // Use Hugging Face API key
    schemaFilePath: "./example/schema.sql",  // Path to your schema file
    dialect: "postgres",  // SQL dialect, can be 'postgres', 'mysql', etc.
    apiUrl: "https://api-inference.huggingface.co/models/facebook/llama-2-7b",  // LLaMA model endpoint
    model: "facebook/llama-2-7b",  // Using LLaMA model by default
  });

  // Query: Get all users data
  const userQuery = await ormgpt.getQuery("SELECT * FROM users");
  console.log(userQuery);

  // Query: Get user data where id is 1
  const userQuery2 = await ormgpt.getQuery("SELECT * FROM users WHERE id = 1");
  console.log(userQuery2);

  // Query: Get all orders for user with id 1
  const orderQuery1 = await ormgpt.getQuery("SELECT * FROM orders WHERE user_id = 1");
  console.log(orderQuery1);

  // Query: Get order with id 1 and associated product details
  const orderQuery2 = await ormgpt.getQuery(
    "SELECT o.id AS order_id, o.quantity, o.order_date, p.name AS product_name, p.price " +
    "FROM orders o JOIN products p ON o.product_id = p.id WHERE o.id = 1"
  );
  console.log(orderQuery2);

  // Query: Get order with id 1, product details, and user information about the author
  const orderQuery3 = await ormgpt.getQuery(
    "SELECT o.id AS order_id, o.quantity, o.order_date, u.username, u.email, p.name AS product_name, p.price " +
    "FROM orders o " +
    "JOIN users u ON o.user_id = u.id " +
    "JOIN products p ON o.product_id = p.id " +
    "WHERE o.id = 1"
  );
  console.log(orderQuery3);

  // Query: Get all orders written between 2023-01-01 and 2023-12-01
  const orderQuery4 = await ormgpt.getQuery(
    "SELECT * FROM orders WHERE order_date BETWEEN '2023-01-01' AND '2023-12-01'"
  );
  console.log(orderQuery4);

  // Query: Add a new order for user with id 3, product with id 1, and quantity of 2
  const orderQuery5 = await ormgpt.getQuery(
    "INSERT INTO orders (user_id, product_id, quantity) VALUES (3, 1, 2)"
  );
  console.log(orderQuery5);

  // Query: Add a new user
  const userQuery3 = await ormgpt.getQuery(
    "INSERT INTO users (username, email) VALUES ('test_user', 'testuser@example.com')"
  );
  console.log(userQuery3);

  // Query: Batch insert of 10 users with dynamic usernames and emails
  const userQuery4 = await ormgpt.getQuery(
    "INSERT INTO users (username, email) " +
    "SELECT 'test_' || generate_series(1, 10), 'test_' || generate_series(1, 10) || '@example.com'"
  );
  console.log(userQuery4);

  // Query: Get products with their categories
  const productCategoryQuery = await ormgpt.getQuery(
    "SELECT p.name AS product_name, c.name AS category_name " +
    "FROM products p " +
    "JOIN product_categories pc ON p.id = pc.product_id " +
    "JOIN categories c ON pc.category_id = c.id"
  );
  console.log(productCategoryQuery);

  // Query: Get all products in a specific category (e.g., 'Electronics')
  const productsInCategoryQuery = await ormgpt.getQuery(
    "SELECT p.name, p.description, p.price FROM products p " +
    "JOIN product_categories pc ON p.id = pc.product_id " +
    "JOIN categories c ON pc.category_id = c.id " +
    "WHERE c.name = 'Electronics'"
  );
  console.log(productsInCategoryQuery);

})();

import http from 'http';

// Log the environment variable for debugging purposes
console.log("Using port:", process.env.PORT);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;  // Default to 3000 if not set

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');  // Modify this as needed for your app's functionality
});

// Bind to 0.0.0.0 to make the server accessible
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});