"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongo = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/legwork";
        await mongoose_1.default.connect(mongoUri);
        console.log("Connected to MongoDB successfully");
    }
    catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
};
exports.default = connectMongo;
