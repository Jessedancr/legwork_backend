import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/legwork";
    await mongoose.connect(mongoUri);

    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

export default connectMongo;
