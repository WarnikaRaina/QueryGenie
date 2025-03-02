// src/mysql.ts
import "dotenv/config";
import { ormGPT } from "../src";
import { createConnection } from "mysql2/promise";  // Ensure promise-based MySQL connection
import { MysqlAdapter } from "../src/MysqlAdapter";

(async () => {
  const client = await createConnection({
    host: 'localhost',
    port: 3307,
    database: 'ormgpt',
    user: 'root',
    password: 'War@123MS', 
  });

  const mysqlAdapter = new MysqlAdapter({
    client
  });

  const ormgpt = new ormGPT({
    apiKey: process.env.HUGGING_FACE_API_KEY || "", // Use Hugging Face API Key
    schemaFilePath: 'C:/Users/warni/Documents/ormAI/example/schema.sql',  // Path to your schema file
    dialect: "mysql", // Specify MySQL dialect
    dbEngineAdapter: mysqlAdapter, // Provide MySQL adapter
  });

  await ormgpt.query(
    "add new user with username 'test' and email 'test@example.com'"
  );

  const users = await ormgpt.query("get all users");
  console.log(users);

  await client.end();
})();
