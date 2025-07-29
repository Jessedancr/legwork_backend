import { Document } from "mongoose";

/**
 * * GENERAL USER INTERFACE
 * * This interface serves as a blueprint for every user
 */
export interface UserInterface extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  bio?: string;
  userType: "dancer" | "client";
  profilePicture?: string;
  deviceToken: string;
}

// * Dancer interface
export interface DancerInterface extends UserInterface {
  jobPrefs?: Record<string, any>;
  resume?: Record<string, any>;
}

// * Client interface
export interface ClientInterface extends UserInterface {
  danceStylePrefs?: string[];
  jobOfferings?: any[]; // Define the structure of job offerings if needed
  organisationName?: string;
  hiringHistory?: Record<string, any>;
}
