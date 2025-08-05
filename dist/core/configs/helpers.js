"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 10;
const hashPassword = async (password) => {
    // * Generate salt
    const salt = await bcrypt_1.default.genSalt(saltRounds);
    console.log("Salt generated: ", salt);
    // * hash password
    const hash = await bcrypt_1.default.hash(password, salt);
    console.log("Password hashed: ", hash);
    return hash;
};
exports.hashPassword = hashPassword;
// * Compare passwords
const comparePasswords = async (plain, hashed) => await bcrypt_1.default.compare(plain, hashed);
exports.comparePasswords = comparePasswords;
