"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUserDetails = getUserDetails;
exports.getDeviceToken = getDeviceToken;
exports.updateUserDetails = updateUserDetails;
exports.uploadProfileImage = uploadProfileImage;
const utils_1 = require("../../../core/configs/utils");
function getUsers(req, res) { }
async function getUserDetails(req, res) {
    const userId = req.params.userId;
    res.setHeader("Content-Type", "application/json");
    try {
        if (!userId || userId === null || userId === "" || userId === undefined) {
            return res.status(404).json({ message: "Invalid user ID" });
        }
        const user = await (0, utils_1.findUserById)(userId);
        if (!user) {
            console.log(`User not found with the provided ID: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User's details gotten", user });
    }
    catch (error) {
        console.error("Unknown error getting user details: ", error);
        return res.status(500).json({ message: "unknown server error" });
    }
}
function getDeviceToken(req, res) { }
async function updateUserDetails(req, res) {
    const { userId } = req.params;
    const updatedDetails = req.body;
    if (!userId || userId === null || userId === "" || userId === undefined) {
        return res.status(404).json({ message: "Invalid user ID" });
    }
    try {
        // * find user by ID
        const result = await (0, utils_1.findUserAndUpdate)(userId, updatedDetails);
        if (!result) {
            console.log("User not found with the provided ID");
            return res
                .status(404)
                .json({ message: "User not found with the provided ID" });
        }
        return res.status(200).json({ message: "User details updated", result });
    }
    catch (error) {
        console.log("Unexpected error while updating user details: ", error);
        return res
            .status(500)
            .json({ message: "Internal server error while updating user details" });
    }
}
async function uploadProfileImage(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    try {
        const { userId } = req.params;
        // * Upload image to Cloudinary
        const result = await (0, utils_1.uploadToCloudinary)(req.file.buffer, "profile_images");
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
        const updatedUser = await (0, utils_1.findUserAndUpdate)(userId, updateData);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "Profile image uploaded and user updated",
            result: safeResult,
        });
    }
    catch (error) {
        console.error("Unexpected error uploading file to Cloudinary:", error);
        res.status(500).json({ message: "Failed to upload file and update user" });
    }
}
