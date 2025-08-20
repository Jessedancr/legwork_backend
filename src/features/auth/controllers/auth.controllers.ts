import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import {
  ClientInterface,
  DancerInterface,
  UserInterface,
} from "../models/user.interface";
import {
  checkUserExists,
  generateToken,
  hashPassword,
  maxAge,
  saveClient,
  saveDancer,
  findUserByUsernameOrEmail,
  comparePasswords,
} from "../../../core/configs/utils";

type confirmPassword = {
  password2: string;
};

type SignupReqBody = UserInterface &
  Partial<DancerInterface> &
  Partial<ClientInterface> &
  confirmPassword;

type loginReqBody = {
  usernameOrEmail: string;
  password: string;
};

export async function signup(
  req: Request<{}, {}, SignupReqBody>,
  res: Response
) {
  // * Extracts the validation errors if any
  const result = validationResult(req);
  console.log("POST auth/signup: Validation result: ", result);

  // * If there are errors while validating the user's input
  if (!result.isEmpty())
    return res.status(400).json({ errors: result.array() });

  // * Validated data
  const data = matchedData<SignupReqBody>(req);

  let { username, email, phoneNumber, userType, password, password2 } = data;

  // * If passwords dont match
  if (password != password2) {
    console.log("Passwords do not match!");
    return res.status(400).send("Passwords do not match!");
  }

  // * Hash the password
  const hashedPassword = await hashPassword(password);
  data.password = hashedPassword;

  try {
    // * Check if the user already exists
    const { exists, field } = await checkUserExists(
      username,
      email,
      phoneNumber
    );

    // If user already exists
    if (exists) {
      console.log(`User already exists with the provided ${field}`);
      return res
        .status(400)
        .json({ message: `User already exists with the provided ${field}` });
    }

    // * If the user is a dancer
    if (userType == "dancer") {
      const savedDancer = await saveDancer({
        ...data,
        jobPrefs: {},
        resume: {},
      });
      // Create JWT for dancer
      const token = await generateToken(savedDancer.id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      console.log("Token generated for dancer: ", token);
      res.status(201).json({
        message: "dancer registered successfully",
        dancer: savedDancer,
        token,
      });
    }

    // * If the user is a client
    else if (userType == "client") {
      const savedClient = await saveClient({
        ...data,
        danceStylePrefs: [],
        jobOfferings: [],
        hiringHistory: {},
      });
      // Create JWT for client
      const token = await generateToken(savedClient.id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      console.log("Token generated for client: ", token);
      res.status(201).json({
        message: "Client registered successfully",
        client: savedClient,
        token,
      });
    } else {
      res.status(400).send("Invalid user type. Must be a dancer or client");
    }
  } catch (error) {
    console.log("An unknown error occured: ", error);
    res.status(500).json({ message: "internal server error", error });
  }
}

export async function login(req: Request<{}, {}, loginReqBody>, res: Response) {
  const result = validationResult(req);
  console.log("POST auth/login: Validation result: ", result);

  // * If there are errors while validating the user's input
  if (!result.isEmpty())
    return res.status(400).send({ errors: result.array() });

  // * Validated data
  const data = matchedData<loginReqBody>(req);
  const { usernameOrEmail, password } = data;

  try {
    // * Find user by username or email
    const user = await findUserByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // * Check if password is correct
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password");
      return res.status(401).json({ message: "Invalid Password" });
    }

    // * Generate token
    const token = await generateToken(user.id);

    // * Set cookie with token
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      // secure: true,
    });

    res.status(200).json({ message: "Login successful", user: user.id, token });
  } catch (error) {
    console.log("Internal server error: ", error);
    return res.status(500).json({ message: "internal server error", error });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("jwt", { httpOnly: true });
  console.log("Logout successful, cookie cleared");
  res.status(200).json({ Message: "logout successful" });
}
