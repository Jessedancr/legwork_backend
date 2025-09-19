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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// * This replaces all the funcs in this module with a fake one
globals_1.jest.mock("../core/configs/utils");
const app = (0, __1.default)("../core/configs/utils");
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const utils = __importStar(require("../core/configs/utils"));
const __1 = __importDefault(require(".."));
// * Mock Funcs from utils.ts
const mockfindUserByUsernameOrEmail = globals_1.jest.mocked(utils.findUserByUsernameOrEmail);
const mockComparePw = globals_1.jest.mocked(utils.comparePasswords);
const mockGenerateAccessToken = globals_1.jest.mocked(utils.generateAccessToken);
const mockGenerateRefreshToken = globals_1.jest.mocked(utils.generateRefreshToken);
const mockHashRefreshToken = globals_1.jest.mocked(utils.hashPassword);
const mockFindUserAndUpdate = globals_1.jest.mocked(utils.findUserAndUpdate);
describe("POST /api/auth/login", () => {
    const fakeUser = {
        id: "123",
        username: "jessedancr",
        password: "password",
    };
    // * Before each test, clear all mocks
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    it("Should return 404 if user is not found", async () => {
        mockfindUserByUsernameOrEmail.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app)
            .post("/api/auth/login")
            .send({ usernameOrEmail: "unknown", password: "password" });
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("message", "User not found");
    });
    it("should return 401 if password is invalid", async () => {
        mockfindUserByUsernameOrEmail.mockResolvedValue(fakeUser);
        mockComparePw.mockResolvedValue(false);
        const res = await (0, supertest_1.default)(app)
            .post("/api/auth/login")
            .send({ usernameOrEmail: "jessedancr", password: "wrongPassword" });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("message", "Invalid Password");
    });
    it("Should return 200 and tokens if login successfull", async () => {
        mockfindUserByUsernameOrEmail.mockResolvedValue(fakeUser);
        mockComparePw.mockResolvedValue(true);
        mockGenerateAccessToken.mockResolvedValue("accessToken");
        mockGenerateRefreshToken.mockResolvedValue("refreshToken");
        mockHashRefreshToken.mockResolvedValue("hashedRefreshToken");
        mockFindUserAndUpdate.mockResolvedValue(fakeUser);
        const res = await (0, supertest_1.default)(app)
            .post("/api/auth/login")
            .send({ usernameOrEmail: "jessedancr", password: "password" });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("accessToken", "accessToken");
        expect(res.body).toHaveProperty("refreshToken", "refreshToken");
    });
});
