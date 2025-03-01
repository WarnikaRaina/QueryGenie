// src/postgres.ts
import "dotenv/config";
import { ormGPT } from "../src";
import { Client } from 'pg';
import { PostgresAdapter } from "../src/PostgresAdapter";

(async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'ormgpt',
    user: 'postgres',
    password: 'War@123PG', 
  });
  await client.connect();

  const postgresAdapter = new PostgresAdapter({
    client
  });

  const ormgpt = new ormGPT({
    apiKey: process.env.HUGGING_FACE_API_KEY || "",  // Use Hugging Face API Key
    schemaFilePath: '/usr/src/app/example/schema.sql',  // Ensure consistency with schema file path
    dialect: "postgres",  // Use PostgreSQL dialect
    dbEngineAdapter: postgresAdapter,  // Provide Postgres adapter
  });

  await ormgpt.query(
    "add new user with username 'test' and email 'test@example.com'"
  );

  const users = await ormgpt.query("get all users");
  console.log(users);

  client.end();
})();
