import { Request, Response } from "express";
import {
  ClientInterface,
  DancerInterface,
  UserInterface,
} from "../models/user.interface";
import { clientModel, dancerModel } from "../models/user.schema";
import { matchedData, validationResult } from "express-validator";
import {
  hashPassword,
  saveClient,
  saveDancer,
} from "../../../core/configs/helpers";

type SignupReqBody = UserInterface &
  Partial<DancerInterface> &
  Partial<ClientInterface>;

export async function signup(
  req: Request<{}, {}, SignupReqBody>,
  res: Response
) {
  // * Destructure request body
  const {
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
    password,
    userType,
    organisationName,
  } = req.body;

  // * Extracts the validation errors if any
  const result = validationResult(req);
  console.log("POST auth/signup: Validation result: ", result);

  // * If there are errors while validating the user's input
  if (!result.isEmpty())
    return res.status(400).send({ errors: result.array() });

  // * Validated data
  const data = matchedData<SignupReqBody>(req);

  // * Hash the password
  data.password = await hashPassword(data.password);

  try {
    // * If the user is a dancer
    if (userType == "dancer") {
      const savedDancer = await saveDancer(data);
      res.status(201).send(savedDancer);
    }
    // * If the user is a client
    else if (userType == "client") {
      const savedClient = await saveClient(data);
      res.status(201).send(savedClient);
    } else {
      res.status(400).send("Invalid user type. Must be a dancer or client");
    }
  } catch (error) {
    console.log("An unknown error occured: ", error);
    res.status(500).send("Internal server error");
  }
}

export function login(req: Request, res: Response) {}

export function logout(req: Request, res: Response) {}
