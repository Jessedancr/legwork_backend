import { Request, Response } from "express";
import {
  uploadToCloudinary,
  findUserAndUpdate,
  findUserById,
} from "../../../core/configs/utils";
import { matchedData, validationResult } from "express-validator";

export function getUsers(req: Request, res: Response) {}

export async function getUserDetails(req: Request, res: Response) {
  const userId = req.params.userId;

  try {
    const user = await findUserById(userId);

    if (!user) {
      console.log(`User not found with the provided ID: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User's details gotten", user });
  } catch (error) {
    console.error("Unknown error getting user details: ", error);
    return res.status(500).json({ message: "unknown server error" });
  }
}

export function getDeviceToken(req: Request, res: Response) {}

export async function updateUserDetails(req: Request, res: Response) {
  const result = validationResult(req);

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
    return res.status(200).json({ message: "User details updated", result });
  } catch (error) {
    console.log("Unexpected error while updating user details: ", error);
    res
      .status(500)
      .json({ message: "Internal server error while updating user details" });
  }
}

export async function uploadProfileImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const { userId } = req.params;

    // * Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "profile_images");
    const { api_key, ...safeResult } = result;
    if (!result) {
      return res
        .status(500)
        .json({ message: "Failed to upload to cloudinary" });
    }

    const updateData = {
      profilePicture: {
        url: result.url,
        publicId: result.public_id,
      },
    };

    const updatedUser = await findUserAndUpdate(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile image uploaded and user updated",
      result: safeResult,
    });
  } catch (error) {
    console.error("Unexpected error uploading file to Cloudinary:", error);
    res.status(500).json({ message: "Failed to upload file and update user" });
  }
}
