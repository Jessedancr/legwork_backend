import bcrypt from "bcrypt";
import { Document } from "mongoose";
import {
  clientModel,
  dancerModel,
} from "../../features/auth/models/user.schema";

const saltRounds = 10;
export const hashPassword = async (password: string) => {
  // * Generate salt
  const salt = await bcrypt.genSalt(saltRounds);

  // * hash password
  const hash = await bcrypt.hash(password, salt);
  console.log("Password hashed: ", hash);
  return hash;
};

// * Compare passwords
export const comparePasswords = async (plain: string, hashed: string) =>
  await bcrypt.compare(plain, hashed);

// * Helper function to save dancer to db
export const saveDancer = async (dancerData: Document) => {
  const dancer = new dancerModel(dancerData);

  try {
    // * Save to db
    const savedDancer = await dancer.save();
    console.log("Dancer saved: ", savedDancer);
  } catch (error) {
    console.log("Error saving dancer to db: ", error);
  }
};

// * Helper function to save client to db
export const saveClient = async (clientData: Document) => {
  const client = new clientModel(clientData);

  try {
    // * Save to db
    const savedClient = await client.save();
    console.log("Client saved: ", savedClient);
  } catch (error) {
    console.log("Error saving client to db: ", error);
  }
};
