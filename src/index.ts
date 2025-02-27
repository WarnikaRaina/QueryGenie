const fetch = require('node-fetch');
import fs from "fs";
import path from "path";
import { ErrorResponse } from "./ErrorResponse";
import { SuccessResponse } from "./SuccessResponse";
import { DatabaseEngineAdapter } from "./DatabaseEngineAdapter";
import { ModelTuning } from "./ModelTuning";

export class ormGPT {
  private apiKey: string;
  private apiUrl: string = "https://api-inference.huggingface.co/models/facebook/llama-2-7b";  // Hugging Face LLaMA model endpoint
  private dbSchema: string;
  private dialect: string;
  private dbEngineAdapter?: DatabaseEngineAdapter;
  private model: string = "facebook/llama-2-7b";  // Default to Hugging Face LLaMA model
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
    this.dbSchema = fs.readFileSync(path.resolve(schemaFilePath), "utf-8");
    this.dialect = dialect;
    this.dbEngineAdapter = dbEngineAdapter;

    if (apiUrl) {
      this.apiUrl = apiUrl;  // Hugging Face URL or custom API URL if needed
    }
    if (model) {
      this.model = model;  // Default model is LLaMA
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

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,  // Use Hugging Face API key here
      },
      body: JSON.stringify({
        model: this.model,  // Use the LLaMA model for generating SQL queries
        inputs: prompt,  // Send prompt for query generation
        ...this.modelOptions,  // Pass model options like temperature, etc.
      }),
    });

    const data = (await response.json()) as ErrorResponse | SuccessResponse;

    if (data.hasOwnProperty("error")) {
      throw new Error((data as ErrorResponse).error.message);
    }

    return (data as SuccessResponse).generated_text;  // Response for the generated query from Hugging Face
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
      console.log("Executing query", query);
      return this.dbEngineAdapter.executeQuery(query);
    } catch (error) {
      console.error("Error when executing query", request);
      throw error;
    }
  }
}
