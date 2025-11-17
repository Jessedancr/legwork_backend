"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientModel = exports.dancerModel = exports.userModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// * Base user schema
const baseUserFields = {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: "" },
    userType: { type: String, required: true, enum: ["dancer", "client"] },
    profilePicture: { type: mongoose_1.Schema.Types.Map, default: {} },
    deviceToken: { type: String, default: "" },
    refreshToken: { type: String, default: null, select: false },
};
const userSchema = new mongoose_1.Schema(baseUserFields, {
    timestamps: true,
});
// * Dancer schema
const dancerSchema = new mongoose_1.Schema({
    ...baseUserFields,
    jobPrefs: { type: mongoose_1.Schema.Types.Map, default: {} },
    resume: { type: mongoose_1.Schema.Types.Map, default: {} },
}, { timestamps: true });
// * Client schema
const clientSchema = new mongoose_1.Schema({
    ...baseUserFields,
    danceStylePrefs: { type: [String], default: [] },
    jobOfferings: { type: [String], default: [] },
    organisationName: { type: String, default: "" },
    hiringHistory: { type: mongoose_1.Schema.Types.Map, default: {} },
}, { timestamps: true });
// * Base user model
exports.userModel = mongoose_1.default.model("user", userSchema);
// * Create separate base models for each collection
exports.dancerModel = mongoose_1.default.model("dancer", dancerSchema, "dancers" // Custom collection name
);
// * Client model
exports.clientModel = mongoose_1.default.model("client", clientSchema, "clients" // Custom collection name
);
