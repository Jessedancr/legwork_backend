import { Request, Response } from "express";
import { findUserAndUpdate } from "../../../core/configs/utils";
import { matchedData, validationResult } from "express-validator";

export function getUsers(req: Request, res: Response) {}

export function getUserById(req: Request, res: Response) {}

export function getUserDetails(req: Request, res: Response) {}

export function getDeviceToken(req: Request, res: Response) {}

export async function updateUserDetails(req: Request, res: Response) {
  const result = validationResult(req);
  console.log(
    "PATCH /:userId/update-user-details: Validation result: ",
    result
  );

  // * If there are errors while validating the user's input
  if (!result.isEmpty())
    return res.status(400).send({ errors: result.array() });

  // * Validated data
  const data = matchedData(req);
  const { userId } = data;

  // * Update details of the current user
  const updatedDetails = req.body;

  try {
    // * find user by ID
    const result = await findUserAndUpdate(userId, updatedDetails);
    if (!result) {
      console.log("User not found with the provided ID");
      return res
        .status(404)
        .json({ message: "User not found with the provided ID" });
    }
    console.log("User details updated successfully");
    return res.status(200).json({ message: "User details updated", result });
  } catch (error) {
    console.log("Unexpected error while updating user details: ", error);
    res.status(500).send("Internal server error while updating user details");
  }
}
