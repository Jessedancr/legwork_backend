import dotenv from "dotenv";

// Load .env before any modules that depend on process.env
dotenv.config();

// Mock firebase-admin so tests don't attempt to initialize with real credentials
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  cert: jest.fn((obj: any) => obj),
}));
