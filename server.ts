// src/server.ts

import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import mysql from 'mysql2';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Setup PostgreSQL connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: 5432,
  user: 'postgres',
  password: 'War@123PG',
  database: 'ormgpt',
});

// Setup MySQL connection
const mysqlConnection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: 'War@123MS',
  database: 'ormgpt',
});

// Middleware
app.use(express.json());

// Sample route to interact with PostgreSQL and MySQL
app.get('/', async (req, res) => {
  try {
    // Example of PostgreSQL query
    const pgResult = await pgPool.query('SELECT NOW()');
    console.log('PostgreSQL result:', pgResult.rows);

    // Example of MySQL query
    mysqlConnection.query('SELECT NOW()', (err, mysqlResult) => {
      if (err) {
        console.error('MySQL error:', err);
        return res.status(500).send('Database error');
      }
      console.log('MySQL result:', mysqlResult);

      res.send('Database connections are working');
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app; // For testing
