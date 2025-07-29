import mongoose, { Schema } from "mongoose";
import {
  ClientInterface,
  DancerInterface,
  UserInterface,
} from "./user.interface";

// * Base user schema
const userSchema = new Schema<UserInterface>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  userType: { type: String, required: true, enum: ["dancer", "client"] },
  profilePicture: { type: String, default: "" },
  deviceToken: { type: String, default: "" },
});

// * Dancer schema
const dancerSchema = new Schema<DancerInterface>({
  jobPrefs: { type: Schema.Types.Mixed, default: {} },
  resume: { type: Schema.Types.Mixed, default: {} },
});

// * Client schema
const clientSchema = new Schema<ClientInterface>({
  danceStylePrefs: { type: [Schema.Types.String], default: [] },
  jobOfferings: { type: [Schema.Types.Mixed], default: [] },
  organisationName: { type: String, default: "" },
  hiringHistory: { type: Schema.Types.Map },
});

// * Base user model
export const userModel = mongoose.model<UserInterface>("UserModel", userSchema);

// * Dancer model extending user model using discriminator()
export const dancerModel = userModel.discriminator<DancerInterface>(
  "Dancer",
  dancerSchema
);

// * Client model extending user model using discriminator()
export const clientModel = userModel.discriminator<ClientInterface>(
  "Client",
  clientSchema
);
