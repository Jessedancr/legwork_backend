import mongoose, { Schema } from "mongoose";
import {
  ClientInterface,
  DancerInterface,
  UserInterface,
} from "./user.interface";

// * Base user schema
const baseUserFields = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, default: "" },
  userType: { type: String, required: true, enum: ["dancer", "client"] },
  profilePicture: { type: String, default: "" },
  deviceToken: { type: String, default: "" },
  refreshToken: { type: String, default: null, select: false },
};
const userSchema = new Schema<UserInterface>(baseUserFields, {
  timestamps: true,
});

// * Dancer schema
const dancerSchema = new Schema<DancerInterface>(
  {
    ...baseUserFields,
    jobPrefs: { type: Schema.Types.Map, default: {} },
    resume: { type: Schema.Types.Map, default: {} },
  },
  { timestamps: true }
);

// * Client schema
const clientSchema = new Schema<ClientInterface>(
  {
    ...baseUserFields,
    danceStylePrefs: { type: [Schema.Types.Array], default: [] },
    jobOfferings: { type: [Schema.Types.Array], default: [] },
    organisationName: { type: String, default: "" },
    hiringHistory: { type: Schema.Types.Map, default: {} },
  },
  { timestamps: true }
);

// * Base user model
export const userModel = mongoose.model<UserInterface>("user", userSchema);

// * Create separate base models for each collection
export const dancerModel = mongoose.model<DancerInterface>(
  "dancer",
  dancerSchema,
  "dancers" // Custom collection name
);

// * Client model
export const clientModel = mongoose.model<ClientInterface>(
  "client",
  clientSchema,
  "clients" // Custom collection name
);
