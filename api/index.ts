import dotenv from "dotenv";
dotenv.config();
import createApp from "../src/app";

import connectMongo from "../src/core/configs/connectMongo";

// Initialize the database connection
const db = connectMongo();

// Create the Express app
const app = createApp(db);

// Export for Vercel serverless
export default app;
