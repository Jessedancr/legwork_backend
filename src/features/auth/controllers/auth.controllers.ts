import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import {
  ClientInterface,
  DancerInterface,
  UserInterface,
} from "../models/user.interface";
import {
  checkUserExists,
  generateAccessToken,
  hashPassword,
  accessTokenMaxAge,
  saveClient,
  saveDancer,
  findUserByUsernameOrEmail,
  findUserById,
  comparePasswords,
  generateRefreshToken,
  findUserAndUpdate,
  refreshTokenMaxAge,
  verifyRefreshToken,
} from "../../../core/configs/utils";

type confirmPassword = {
  password2: string;
};

type refreshTokenReqBody = {
  refreshToken: string;
};

type SignupReqBody = UserInterface &
  Partial<DancerInterface> &
  Partial<ClientInterface> &
  confirmPassword;

export type loginReqBody = {
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

    // * If user already exists
    if (exists) {
      console.log(`User already exists with the provided ${field}`);
      return res.status(400).json({ message: `User exists with ${field}` });
    }

    // * If the user is a dancer
    if (userType == "dancer") {
      const savedDancer = await saveDancer({
        ...data,
        jobPrefs: {},
        resume: {},
      });
      // Create Tokens for dancer
      const accessToken = await generateAccessToken(savedDancer.id);
      const refreshToken = await generateRefreshToken(savedDancer.id);

      // Hash refresh token and store it in db
      const hashedRefreshToken = await hashPassword(refreshToken);
      await findUserAndUpdate(savedDancer.id, {
        refreshToken: hashedRefreshToken,
      });

      // Set the tokens
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: accessTokenMaxAge * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenMaxAge * 1000,
      });
      console.log("Token generated for dancer: ", accessToken);
      res.status(201).json({
        message: "dancer registered successfully",
        dancer: savedDancer,
        accessToken,
        refreshToken,
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
      // Create Tokens for client
      const accessToken = await generateAccessToken(savedClient.id);
      const refreshToken = await generateRefreshToken(savedClient.id);

      // Hash refresh token and store it in db
      const hashedRefreshToken = await hashPassword(refreshToken);
      await findUserAndUpdate(savedClient.id, {
        refreshToken: hashedRefreshToken,
      });

      // Set the tokens
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: accessTokenMaxAge * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenMaxAge * 1000,
      });

      console.log("Token generated for client: ", accessToken);
      res.status(201).json({
        message: "Client registered successfully",
        client: savedClient,
        accessToken,
        refreshToken,
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

    // * Generate tokens and hash refresh token
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    const hashedRefreshToken = await hashPassword(refreshToken);
    await findUserAndUpdate(user.id, { refreshToken: hashedRefreshToken });

    // * Set cookie with token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: accessTokenMaxAge * 1000,
      // secure: true,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenMaxAge * 1000,
    });

    res
      .status(200)
      .json({ message: "Login successful", user, accessToken, refreshToken });
  } catch (error) {
    console.log("Internal server error: ", error);
    return res.status(500).json({ message: "internal server error", error });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("accessToken", { httpOnly: true });
  res.clearCookie("refreshToken", { httpOnly: true });
  console.log("Logout successful, cookies cleared");
  res.status(200).json({ message: "logout successful, cookies cleared" });
}

/**
 * * This function refreshes both access and refresh tokens
 */
export async function refreshTokens(
  req: Request<{}, {}, refreshTokenReqBody>,
  res: Response
) {
  try {
    // * Get refresh token from cookies or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      console.log("Refresh token not provided");
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    // * Verify the refresh token
    const payload: any = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.id) {
      console.log("Invalid refresh token");
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // * Find user by ID
    const user = await findUserById(payload.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // * Generate new tokens
    const newAccessToken = await generateAccessToken(user.id);
    const newRefreshToken = await generateRefreshToken(user.id);

    // * Hash and store the new refresh token
    const hashedRefreshToken = await hashPassword(newRefreshToken);
    await findUserAndUpdate(user.id, { refreshToken: hashedRefreshToken });

    // * Set new cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: accessTokenMaxAge * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: refreshTokenMaxAge * 1000,
    });

    console.log("Tokens refreshed successfully");
    res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.log("Refresh token error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
