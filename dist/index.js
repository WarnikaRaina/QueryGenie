"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ormGPT = void 0;

// Replace the static import of node-fetch with dynamic import to fix the ESM issue
let node_fetch_1;
(async () => {
    node_fetch_1 = (await import("node-fetch")).default; // Dynamically importing node-fetch
})();

const express_1 = __importDefault(require("express"));  // Import Express
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));

// Create an instance of Express
const app = express_1.default();
const port = 3000;  // Port to run the server

// Define the ormGPT class (same as your original implementation)
class ormGPT {
    constructor({ apiKey, dialect, schemaFilePath, dbEngineAdapter, apiUrl, model, modelOptions }) {
        this.apiUrl = "https://api-inference.huggingface.co/models/facebook/llama-2-7b"; // Hugging Face LLaMA model endpoint
        this.model = "facebook/llama-2-7b"; // Default to Hugging Face LLaMA model
        this.modelOptions = {
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        };
        this.apiKey = apiKey;

        // Adjust the schemaFilePath to match the Docker container path
        // Assuming schema.sql is copied to /usr/src/app/example/schema.sql
        const schemaPath = path_1.default.resolve(schemaFilePath);
        
        // Read the schema file
        this.dbSchema = fs_1.default.readFileSync(schemaPath, "utf-8");
        this.dialect = dialect;
        this.dbEngineAdapter = dbEngineAdapter;
        if (apiUrl) {
            this.apiUrl = apiUrl; // Hugging Face URL or custom API URL if needed
        }
        if (model) {
            this.model = model; // Default model is LLaMA
        }
        if (modelOptions) {
            this.modelOptions = modelOptions;
        }
    }

    async getResponse(request) {
        const prompt = `
                You are an SQL engine brain.
                You are using ${this.dialect} dialect.
                Having db schema as follows:
                ${this.dbSchema}

                Write a query to fulfill the user request: ${request}

                Don't write anything else than SQL query.
            `;
        
        // Wait for the dynamic import to finish before proceeding with the fetch call
        const response = await node_fetch_1(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`, // Use Hugging Face API key here
            },
            body: JSON.stringify({
                model: this.model,
                inputs: prompt,
                ...this.modelOptions,
            }),
        });

        const data = (await response.json());
        if (data.hasOwnProperty("error")) {
            throw new Error(data.error.message);
        }
        return data.generated_text; // Response for the generated query from Hugging Face
    }

    async getQuery(request) {
        try {
            return await this.getResponse(request);
        } catch (error) {
            console.error("Error when generating query", request);
            throw error;
        }
    }

    async query(request) {
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
exports.ormGPT = ormGPT;

// Set up Express Routes
const ormGPTInstance = new ormGPT({
    apiKey: "your-huggingface-api-key",
    dialect: "postgresql",  // Use your preferred database dialect
    schemaFilePath: "/usr/src/app/example/schema.sql",  // Updated to match the Docker container path
    dbEngineAdapter: null,  // Set this to your actual database adapter
});

// Add a route to handle the root path ('/')
app.get("/", (req, res) => {
    res.send("Welcome to the ORM GPT Application!");  // Response for the root URL
});

// Add a route to handle SQL query generation requests
app.use(express_1.default.json());  // Middleware to parse JSON requests

app.post('/generate-query', async (req, res) => {
    const { request } = req.body;  // Get the user request from the body
    if (!request) {
        return res.status(400).json({ error: "Request body must contain 'request' field." });
    }

    try {
        const query = await ormGPTInstance.query(request);
        res.json({ query });  // Send back the generated SQL query
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
