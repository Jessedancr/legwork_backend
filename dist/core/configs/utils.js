"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = exports.findUserAndUpdate = exports.findUserById = exports.findUserByUsernameOrEmail = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = exports.refreshTokenMaxAge = exports.accessTokenMaxAge = exports.saveClient = exports.saveDancer = exports.checkUserExists = exports.comparePasswords = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = require("../../features/auth/models/user.schema");
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../../core/configs/cloudinary"));
// * HASH PASSWORD
const hashPassword = async (password) => {
    const saltRounds = 10;
    // * Generate salt
    const salt = await bcrypt_1.default.genSalt(saltRounds);
    // * hash password
    const hash = await bcrypt_1.default.hash(password, salt);
    return hash;
};
exports.hashPassword = hashPassword;
// * COMPARE PASSWORD
const comparePasswords = async (plain, hashed) => await bcrypt_1.default.compare(plain, hashed);
exports.comparePasswords = comparePasswords;
/**
 * * Check if the user exists in either dancer or client collections
 * * If either exists, return true
 * * Else return false
 */
const checkUserExists = async (username, email, phoneNumber) => {
    // Check username
    const [dancerUsername, clientUsername] = await Promise.all([
        user_schema_1.dancerModel.findOne({ username }),
        user_schema_1.clientModel.findOne({ username }),
    ]);
    if (dancerUsername || clientUsername) {
        return { exists: true, field: "username" };
    }
    // Check email
    const [dancerEmail, clientEmail] = await Promise.all([
        user_schema_1.dancerModel.findOne({ email }),
        user_schema_1.clientModel.findOne({ email }),
    ]);
    if (dancerEmail || clientEmail) {
        return { exists: true, field: "email" };
    }
    // Check phone number
    const [dancerPhone, clientPhone] = await Promise.all([
        user_schema_1.dancerModel.findOne({ phoneNumber }),
        user_schema_1.clientModel.findOne({ phoneNumber }),
    ]);
    if (dancerPhone || clientPhone) {
        return { exists: true, field: "phoneNumber" };
    }
    return { exists: false };
};
exports.checkUserExists = checkUserExists;
// * SAVE DANCER TO DB
const saveDancer = async (dancerData) => {
    const dancer = new user_schema_1.dancerModel(dancerData);
    try {
        // * Save to db
        const savedDancer = await dancer.save();
        return savedDancer;
    }
    catch (error) {
        console.log("Error saving dancer to db: ", error);
        throw error;
    }
};
exports.saveDancer = saveDancer;
// * SAVE CLIENT TO DB
const saveClient = async (clientData) => {
    const client = new user_schema_1.clientModel(clientData);
    try {
        // * Save to db
        const savedClient = await client.save();
        return savedClient;
    }
    catch (error) {
        console.log("Error saving client to db: ", error);
        throw error;
    }
};
exports.saveClient = saveClient;
// * GENERATE JWT TOKENS
exports.accessTokenMaxAge = 60 * 60 * 24; // 1 day
exports.refreshTokenMaxAge = 60 * 60 * 24 * 7; // 1 week
const generateAccessToken = async (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: exports.accessTokenMaxAge,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: exports.refreshTokenMaxAge,
    });
};
exports.generateRefreshToken = generateRefreshToken;
// * VERIFY JWT TOKENS
const verifyAccessToken = async (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = async (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * * FIND USER
 * * This function is used during login
 */
const findUserByUsernameOrEmail = async (identifier) => {
    try {
        // * Find user by username or email
        const [dancer, client] = await Promise.all([
            user_schema_1.dancerModel.findOne({
                $or: [{ username: identifier }, { email: identifier }],
            }),
            user_schema_1.clientModel.findOne({
                $or: [{ username: identifier }, { email: identifier }],
            }),
        ]);
        if (dancer) {
            console.log("Dancer found");
            return dancer;
        }
        else if (client) {
            console.log("Client found");
            return client;
        }
        else {
            console.log("user not found");
            return null;
        }
    }
    catch (error) {
        console.log("Error finding user: ", error);
        return null;
    }
};
exports.findUserByUsernameOrEmail = findUserByUsernameOrEmail;
// * FIND USER BY ID
const findUserById = async (id) => {
    try {
        const [dancer, client] = await Promise.all([
            user_schema_1.dancerModel.findById(id),
            user_schema_1.clientModel.findById(id),
        ]);
        if (dancer) {
            return dancer;
        }
        else if (client) {
            return client;
        }
        else {
            console.log("User not found in either collection");
            return null;
        }
    }
    catch (error) {
        console.log("Error finding user by ID: ", error);
        return null;
    }
};
exports.findUserById = findUserById;
// * FIND USER BY ID AND UPDATE
const findUserAndUpdate = async (id, updateData) => {
    try {
        const [updatedDancer, updatedClient] = await Promise.all([
            user_schema_1.dancerModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }),
            user_schema_1.clientModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }),
        ]);
        if (updatedDancer) {
            return updatedDancer;
        }
        else if (updatedClient) {
            return updatedClient;
        }
        else {
            console.log("User not found in either collection");
            return null;
        }
    }
    catch (error) {
        console.log("Error finding  and updating user: ", error);
        return error;
    }
};
exports.findUserAndUpdate = findUserAndUpdate;
// * CLOUDINARY UPLOAD SETUP
const uploadToCloudinary = (buffer, folder) => {
    try {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.default.uploader.upload_stream({
                folder,
                resource_type: "auto",
            }, (error, result) => {
                if (error) {
                    console.error("Failed to upload to cloudinary: ", error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Cloudinary upload returned undefined result"));
                }
                resolve(result);
            });
            // Pipe the buffer to the Cloudinary upload stream
            stream_1.Readable.from(buffer).pipe(stream);
        });
    }
    catch (error) {
        console.log("Unexpected cloudinary stream error: ", error);
        return Promise.reject(error);
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
