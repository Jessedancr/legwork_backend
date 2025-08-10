import { Request, Response } from "express";
import {
  ClientInterface,
  DancerInterface,
  UserInterface,
} from "../models/user.interface";
import { matchedData, validationResult } from "express-validator";
import {
  checkUserExists,
  generateToken,
  hashPassword,
  maxAge,
  saveClient,
  saveDancer,
} from "../../../core/configs/utils";

type confirmPassword = {
  password2: string;
};

type SignupReqBody = UserInterface &
  Partial<DancerInterface> &
  Partial<ClientInterface> &
  confirmPassword;

export async function signup(
  req: Request<{}, {}, SignupReqBody>,
  res: Response
) {
  // * Extracts the validation errors if any
  const result = validationResult(req);
  console.log("POST auth/signup: Validation result: ", result);

  // * If there are errors while validating the user's input
  if (!result.isEmpty())
    return res.status(400).send({ errors: result.array() });

  // * Validated data
  const data = matchedData<SignupReqBody>(req);

  let {
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
    userType,
    password,
    password2,
    organisationName,
  } = data;

  // * If passwords dont match
  if (password != password2) {
    console.log("Passwords do not match!");
    return res.status(400).send("Passwords do not match!");
  }

  // * Hash the password
  password = await hashPassword(password);

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
        .send(`User already exists with the provided ${field}`);
    }

    // * If the user is a dancer
    if (userType == "dancer") {
      const savedDancer = await saveDancer(data);
      // Create JWT for dancer
      const token = await generateToken(savedDancer.id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      console.log("Token generated for dancer: ", token);
      res.status(201).json({
        message: "dancer registered successfully",
        dancer: savedDancer.id,
        token,
      });
    }

    // * If the user is a client
    else if (userType == "client") {
      const savedClient = await saveClient(data);
      // Create JWT for client
      const token = await generateToken(savedClient.id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      console.log("Token generated for client: ", token);
      res.status(201).json({
        message: "Client registered successfully",
        client: savedClient.id,
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

export function login(req: Request, res: Response) {}

export function logout(req: Request, res: Response) {}
