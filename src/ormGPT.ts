import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { ErrorResponse } from "./ErrorResponse";
import { SuccessResponse } from "./SuccessResponse";
import { DatabaseEngineAdapter } from "./DatabaseEngineAdapter";
import { ModelTuning } from "./ModelTuning";

// Function to load schema file (Docker and Local environment support)
async function loadSchema(schemaFilePath: string): Promise<string> {
  let schemaPath: string;

  // Check if we're running inside Docker (using an environment variable or flag)
  const isDocker = process.env.DOCKER_ENV === 'true';  // Adjust according to how you determine Docker environment

  if (isDocker) {
    // In Docker, the schema file might be in a different location
    schemaPath = path.resolve('/usr/src/app/example', schemaFilePath);
  } else {
    // In local development, use the local path
    schemaPath = path.resolve(schemaFilePath);
  }

  try {
    return fs.readFileSync(schemaPath, "utf-8");
  } catch (error) {
    console.error("Error reading schema file at path:", schemaPath);
    throw error;
  }
}

// Export the ormGPT class
export class ormGPT {
  private apiKey: string;
  public apiUrl: string = "https://api-inference.huggingface.co/models/Salesforce/codegen-350M-mono";  // Hugging Face LLaMA model endpoint
  private dbSchema!: string;  // Marked as definitely assigned using '!'
  private dialect: string;
  private dbEngineAdapter?: DatabaseEngineAdapter;
  private model: string = "Salesforce/codegen-350M-mono";  // Default to Hugging Face LLaMA model
  private modelOptions: ModelTuning = {
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  constructor({
    apiKey,
    dialect,
    schemaFilePath,
    dbEngineAdapter,
    apiUrl,
    model,
    modelOptions,
  }: {
    apiKey: string;
    schemaFilePath: string;
    dialect: "postgres" | "mysql" | "sqlite";
    dbEngineAdapter?: DatabaseEngineAdapter;
    apiUrl?: string;
    model?: string;
    modelOptions?: ModelTuning;
  }) {
    this.apiKey = apiKey;

    // Validate dbEngineAdapter
    if (!dbEngineAdapter) {
      throw new Error("Database engine adapter is required.");
    }

    this.dialect = dialect;
    this.dbEngineAdapter = dbEngineAdapter;

    // Asynchronously load the schema and assign it to dbSchema
    loadSchema(schemaFilePath)
      .then((schema) => {
        this.dbSchema = schema;
      })
      .catch((error) => {
        console.error("Error loading schema:", error);
        throw error;
      });

    if (apiUrl) {
      this.apiUrl = apiUrl;  // Use the custom Hugging Face URL if provided
    }
    if (model) {
      this.model = model;  // Default model is salesforce
    }
    if (modelOptions) {
      this.modelOptions = modelOptions;
    }
  }

  private async getResponse(request: string): Promise<string> {
    const prompt = `
      You are an SQL engine brain.
      You are using ${this.dialect} dialect.
      Having db schema as follows:
      ${this.dbSchema}
      
      Write a query to fulfil the user request: ${request}
      
      Don't write anything else than SQL query.
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          inputs: prompt,
          ...this.modelOptions,
        }),
      });

      const data = (await response.json()) as ErrorResponse | SuccessResponse;

      if (data.hasOwnProperty("error")) {
        console.error("Error from Hugging Face:", (data as ErrorResponse).error.message);
        throw new Error((data as ErrorResponse).error.message);
      }

      return (data as SuccessResponse).generated_text;
    } catch (error) {
      console.error("Error when fetching response from Hugging Face:", error);
      throw error;
    }
  }

  public async getQuery(request: string): Promise<string> {
    try {
      return await this.getResponse(request);
    } catch (error) {
      console.error("Error when generating query", request);
      throw error;
    }
  }

  public async query(request: string): Promise<any[]> {
    try {
      if (!this.dbEngineAdapter) {
        throw new Error("No dbEngineAdapter provided");
      }

      const query = await this.getQuery(request);
      console.log("Generated query:", query);

      // Ensure query is valid
      if (!query.trim()) {
        throw new Error("Generated query is empty.");
      }

      console.log("Executing query:", query);
      return this.dbEngineAdapter.executeQuery(query);
    } catch (error) {
      console.error("Error when executing query", request, error);
      throw error;
    }
  }
}
