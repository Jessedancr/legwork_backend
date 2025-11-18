import mongoose from "mongoose";

let isConnected = false;

const connectMongo = async () => {
  if (isConnected) {
    console.log("Using existing DB connection");
    return mongoose.connection;
  }
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/legwork";
    await mongoose.connect(mongoUri);
    isConnected = true;

    console.log("Connected to MongoDB successfully");
    return mongoose.connection
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

export default connectMongo;
