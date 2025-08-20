import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  clientModel,
  dancerModel,
} from "../../features/auth/models/user.schema";
import {
  ClientInterface,
  DancerInterface,
} from "../../features/auth/models/user.interface";

/**
 * * HASH PASSWORD
 */
export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  // * Generate salt
  const salt = await bcrypt.genSalt(saltRounds);

  // * hash password
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * * COMPARE PASSWORDS
 */
export const comparePasswords = async (plain: string, hashed: string) =>
  await bcrypt.compare(plain, hashed);

/**
 * * Check if the user exists in either dancer or client collections
 * * If either exists, return true
 * * Else return false
 */
export const checkUserExists = async (
  username: string,
  email: string,
  phoneNumber: string
): Promise<{ exists: boolean; field?: string }> => {
  // Check username
  const [dancerUsername, clientUsername] = await Promise.all([
    dancerModel.findOne({ username }),
    clientModel.findOne({ username }),
  ]);
  if (dancerUsername || clientUsername) {
    return { exists: true, field: "username" };
  }

  // Check email
  const [dancerEmail, clientEmail] = await Promise.all([
    dancerModel.findOne({ email }),
    clientModel.findOne({ email }),
  ]);
  if (dancerEmail || clientEmail) {
    return { exists: true, field: "email" };
  }

  // Check phone number
  const [dancerPhone, clientPhone] = await Promise.all([
    dancerModel.findOne({ phoneNumber }),
    clientModel.findOne({ phoneNumber }),
  ]);
  if (dancerPhone || clientPhone) {
    return { exists: true, field: "phoneNumber" };
  }

  return { exists: false };
};

/**
 * * SAVE DANCER TO DB
 */
export const saveDancer = async (dancerData: DancerInterface) => {
  const dancer = new dancerModel(dancerData);
  try {
    // * Save to db
    const savedDancer = await dancer.save();
    console.log("Dancer saved: ", savedDancer);
    return savedDancer;
  } catch (error) {
    console.log("Error saving dancer to db: ", error);
    throw error;
  }
};

/**
 * * SAVE CLIENT TO DB
 */
export const saveClient = async (clientData: ClientInterface) => {
  const client = new clientModel(clientData);
  try {
    // * Save to db
    const savedClient = await client.save();
    console.log("Client saved: ", savedClient);
    return savedClient;
  } catch (error) {
    console.log("Error saving client to db: ", error);
    throw error;
  }
};

/**
 * * GENERATE JWT TOKEN
 */
export const maxAge = 60 * 30; // 30 mins
export const generateToken = async (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: maxAge,
  });
};

/**
 * * FIND USER
 */
export const findUserByUsernameOrEmail = async (identifier: string) => {
  try {
    // * Find user by username or email
    const [dancer, client] = await Promise.all([
      dancerModel.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      }),
      clientModel.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      }),
    ]);
    if (dancer) {
      console.log("Dancer found");
      return dancer;
    } else if (client) {
      console.log("Client found");
      return client;
    } else {
      console.log("user not found");
      return null;
    }
  } catch (error) {
    console.log("Error finding user: ", error);
    return null;
  }
};

// * FIND USER BY ID
export const findUserAndUpdate = async (
  id: string,
  updateData: Record<string, any>
) => {
  try {
    const [updatedDancer, updatedClient] = await Promise.all([
      dancerModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }),
      clientModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }),
    ]);

    if (updatedDancer) {
      return updatedDancer;
    } else if (updatedClient) {
      return updatedClient;
    } else {
      console.log("User not found in either collection");
      return null;
    }
  } catch (error) {
    console.log("Error finding  and updating user: ", error);
  }
};
