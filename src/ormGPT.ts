// src/ormGPT.ts

import { DatabaseEngineAdapter } from "./DatabaseEngineAdapter";  // Reference to the correct path
import { PostgresAdapter } from "./PostgresAdapter"; // Optional: Import specific adapters for type-checking
import { MysqlAdapter } from "./MysqlAdapter"; // Optional: Import specific adapters for type-checking

export class ormGPT {
  private apiKey: string;
  private schemaFilePath: string;
  private dialect: string;
  private dbEngineAdapter: DatabaseEngineAdapter;

  constructor(options: {
    apiKey: string;
    schemaFilePath: string;
    dialect: string;
    dbEngineAdapter: DatabaseEngineAdapter;
  }) {
    this.apiKey = options.apiKey;
    this.schemaFilePath = options.schemaFilePath;
    this.dialect = options.dialect;
    this.dbEngineAdapter = options.dbEngineAdapter;
  }

  // Method to handle natural language query and convert it into SQL
  public async query(naturalLanguageQuery: string): Promise<any> {
    try {
      // Convert the human text (natural language) into SQL (you might need an NLP model here)
      const sqlQuery = this.convertToSQL(naturalLanguageQuery);

      // Ensure the dbEngineAdapter is passed and can execute queries
      if (!this.dbEngineAdapter) {
        throw new Error("No dbEngineAdapter provided");
      }

      // Execute the SQL query using the provided dbEngineAdapter
      const result = await this.dbEngineAdapter.executeQuery(sqlQuery);
      return result;
    } catch (error) {
      console.error("Error during query execution:", error);
      throw new Error("Failed to execute query");
    }
  }

  // Placeholder for the conversion logic (you can integrate with GPT or any NLP model here)
  private convertToSQL(naturalLanguageQuery: string): string {
    // Basic examples of conversion - this can be more sophisticated or use GPT model for conversion
    if (naturalLanguageQuery.toLowerCase().includes("get all users")) {
      return "SELECT * FROM users";
    }

    // If no match, return a default query or throw an error
    return "";
  }
}
