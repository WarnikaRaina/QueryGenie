// src/server.ts

import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import mysql from 'mysql2';
import { MysqlAdapter } from './MysqlAdapter'; // Import MySQL adapter
import { PostgresAdapter } from './PostgresAdapter'; // Import Postgres adapter
import { ormGPT } from './ormGPT'; // Assuming you have an ormGPT instance in the src directory

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Setup PostgreSQL connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: 5432,
  user: 'postgres',
  password: 'abc',
  database: 'ormgpt',
});

// Setup MySQL connection
const mysqlConnection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: 'xyz',
  database: 'ormgpt',
});

// Initialize the PostgreSQL adapter
const pgAdapter = new PostgresAdapter({
  client: pgPool, // Use Pool for PostgreSQL
});

// Initialize the MySQL adapter
const mysqlAdapter = new MysqlAdapter({
  client: mysqlConnection, // Use Connection for MySQL
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

// Initialize ormGPT with a dbEngineAdapter (PostgreSQL or MySQL)
const ormgpt = new ormGPT({
  apiKey: process.env.HUGGING_FACE_API_KEY || "",
  schemaFilePath: './example/schema.sql',
  dialect: 'postgres', // Change to 'mysql' for MySQL
  dbEngineAdapter: pgAdapter, // Change to mysqlAdapter if using MySQL
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
