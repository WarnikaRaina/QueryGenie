import { DatabaseEngineAdapter } from "./DatabaseEngineAdapter";
import { Client, Pool, PoolClient } from "pg"; // Import PoolClient for connection management

export class PostgresAdapter implements DatabaseEngineAdapter {
  private db: Client | Pool;  // Can accept both Client and Pool

  constructor({ client }: { client: Client | Pool }) {
    this.db = client;
  }

  async executeQuery(query: string): Promise<unknown[]> {
    if (this.db instanceof Pool) {
      // If it's a Pool, get a PoolClient using connect()
      const client: PoolClient = await this.db.connect(); // Get a PoolClient from the Pool
      try {
        const res = await client.query(query); // Execute the query using PoolClient
        return res.rows; // Return the query result rows
      } finally {
        client.release(); // Release the client back to the pool
      }
    } else if (this.db instanceof Client) {
      // If it's a single Client, directly execute the query
      const res = await this.db.query(query);
      return res.rows; // Return the query result rows
    }
    throw new Error("Unsupported client type"); // If it's neither a Pool nor Client, throw an error
  }
}
