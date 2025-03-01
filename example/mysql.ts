import "dotenv/config";
import { ormGPT } from "../src";
import { createConnection } from "mysql2/promise";
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
    schemaFilePath: "./example/schema.sql",
    dialect: "postgres", // or "mysql" or any other dialect you are using
    dbEngineAdapter: mysqlAdapter,
  });

  await ormgpt.query(
    "add new user with username 'test' and email 'test@example.com'"
  );

  const users = await ormgpt.query("get all users");
  console.log(users);

  client.end();
})();
