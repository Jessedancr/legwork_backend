"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.refreshTokens = refreshTokens;
const express_validator_1 = require("express-validator");
const utils_1 = require("../../../core/configs/utils");
async function signup(req, res) {
    // * Extracts the validation errors if any
    const result = (0, express_validator_1.validationResult)(req);
    console.log("POST auth/signup: Validation result: ", result);
    // * If there are errors while validating the user's input
    if (!result.isEmpty())
        return res.status(400).json({ errors: result.array() });
    // * Validated data
    const data = (0, express_validator_1.matchedData)(req);
    let { username, email, phoneNumber, userType, password, password2 } = data;
    // * If passwords dont match
    if (password != password2) {
        console.log("Passwords do not match!");
        return res.status(400).json({ message: "Passwords do not match!" });
    }
    // * Hash the password
    const hashedPassword = await (0, utils_1.hashPassword)(password);
    data.password = hashedPassword;
    try {
        // * Check if the user already exists
        const { exists, field } = await (0, utils_1.checkUserExists)(username, email, phoneNumber);
        // * If user already exists
        if (exists) {
            console.log(`User already exists with the provided ${field}`);
            return res.status(400).json({ message: `User exists with ${field}` });
        }
        // * If the user is a dancer
        if (userType == "dancer") {
            const savedDancer = await (0, utils_1.saveDancer)({
                ...data,
                jobPrefs: {},
                resume: {},
            });
            // Create Tokens for dancer
            const accessToken = await (0, utils_1.generateAccessToken)(savedDancer.id);
            const refreshToken = await (0, utils_1.generateRefreshToken)(savedDancer.id);
            // Hash refresh token and store it in db
            const hashedRefreshToken = await (0, utils_1.hashPassword)(refreshToken);
            await (0, utils_1.findUserAndUpdate)(savedDancer.id, {
                refreshToken: hashedRefreshToken,
            });
            // Set the tokens
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                maxAge: utils_1.accessTokenMaxAge * 1000,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: utils_1.refreshTokenMaxAge * 1000,
            });
            res.status(201).json({
                message: "dancer registered successfully",
                dancer: savedDancer,
                accessToken,
                refreshToken,
            });
        }
        // * If the user is a client
        else if (userType == "client") {
            const savedClient = await (0, utils_1.saveClient)({
                ...data,
                danceStylePrefs: [],
                jobOfferings: [],
                hiringHistory: {},
            });
            // Create Tokens for client
            const accessToken = await (0, utils_1.generateAccessToken)(savedClient.id);
            const refreshToken = await (0, utils_1.generateRefreshToken)(savedClient.id);
            // Hash refresh token and store it in db
            const hashedRefreshToken = await (0, utils_1.hashPassword)(refreshToken);
            await (0, utils_1.findUserAndUpdate)(savedClient.id, {
                refreshToken: hashedRefreshToken,
            });
            // Set the tokens
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                maxAge: utils_1.accessTokenMaxAge * 1000,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: utils_1.refreshTokenMaxAge * 1000,
            });
            res.status(201).json({
                message: "Client registered successfully",
                client: savedClient,
                accessToken,
                refreshToken,
            });
        }
        else {
            res
                .status(400)
                .json({ message: "Invalid user type. Must be a dancer or client" });
        }
    }
    catch (error) {
        console.log("An unknown error occured: ", error);
        res.status(500).json({ message: "internal server error", error });
    }
}
async function login(req, res) {
    const result = (0, express_validator_1.validationResult)(req);
    console.log("POST auth/login: Validation result: ", result);
    // * If there are errors while validating the user's input
    if (!result.isEmpty())
        return res.status(400).json({ errors: result.array() });
    // * Validated data
    const data = (0, express_validator_1.matchedData)(req);
    const { usernameOrEmail, password } = data;
    try {
        // * Find user by username or email
        const user = await (0, utils_1.findUserByUsernameOrEmail)(usernameOrEmail);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // * Check if password is correct
        const isPasswordValid = await (0, utils_1.comparePasswords)(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password");
            return res.status(401).json({ message: "Invalid Password" });
        }
        // * Generate tokens and hash refresh token
        const accessToken = await (0, utils_1.generateAccessToken)(user.id);
        const refreshToken = await (0, utils_1.generateRefreshToken)(user.id);
        const hashedRefreshToken = await (0, utils_1.hashPassword)(refreshToken);
        await (0, utils_1.findUserAndUpdate)(user.id, { refreshToken: hashedRefreshToken });
        // * Set cookie with token
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: utils_1.accessTokenMaxAge * 1000,
            // secure: true,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: utils_1.refreshTokenMaxAge * 1000,
        });
        res
            .status(200)
            .json({ message: "Login successful", user, accessToken, refreshToken });
    }
    catch (error) {
        console.log("Internal server error: ", error);
        return res.status(500).json({ message: "internal server error", error });
    }
}
function logout(req, res) {
    res.clearCookie("accessToken", { httpOnly: true });
    res.clearCookie("refreshToken", { httpOnly: true });
    console.log("Logout successful, cookies cleared");
    res.status(200).json({ message: "logout successful, cookies cleared" });
}
/**
 * * This function refreshes both access and refresh tokens
 */
async function refreshTokens(req, res) {
    try {
        // * Get refresh token from cookies or body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            console.log("Refresh token not provided");
            return res.status(401).json({ message: "Refresh token not provided" });
        }
        // * Verify the refresh token
        const payload = await (0, utils_1.verifyRefreshToken)(refreshToken);
        if (!payload || !payload.id) {
            console.log("Invalid refresh token");
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        // * Find user by ID
        const user = await (0, utils_1.findUserById)(payload.id);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        // * Generate new tokens
        const newAccessToken = await (0, utils_1.generateAccessToken)(user.id);
        const newRefreshToken = await (0, utils_1.generateRefreshToken)(user.id);
        // * Hash and store the new refresh token
        const hashedRefreshToken = await (0, utils_1.hashPassword)(newRefreshToken);
        await (0, utils_1.findUserAndUpdate)(user.id, { refreshToken: hashedRefreshToken });
        // * Set new cookies
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            maxAge: utils_1.accessTokenMaxAge * 1000,
        });
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            maxAge: utils_1.refreshTokenMaxAge * 1000,
        });
        console.log("Tokens refreshed successfully");
        res.status(200).json({
            message: "Tokens refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        console.log("Refresh token error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
