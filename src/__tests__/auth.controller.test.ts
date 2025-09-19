// * This replaces all the funcs in this module with a fake one
jest.mock("../core/configs/utils");
const app = createApp("../core/configs/utils");

import request from "supertest";
import { jest } from "@jest/globals";
import * as utils from "../core/configs/utils";
import createApp from "..";

// * Mock Funcs from utils.ts
const mockFindUserByUsernameOrEmail = jest.mocked(
  utils.findUserByUsernameOrEmail
);
const mockComparePw = jest.mocked(utils.comparePasswords);
const mockGenerateAccessToken = jest.mocked(utils.generateAccessToken);
const mockGenerateRefreshToken = jest.mocked(utils.generateRefreshToken);
const mockHashRefreshToken = jest.mocked(utils.hashPassword);
const mockFindUserAndUpdate = jest.mocked(utils.findUserAndUpdate);

describe("POST /api/auth/login", () => {
  const fakeUser = {
    id: "123",
    username: "jessedancr",
    password: "password",
  } as any;

  // * Before each test, clear all mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should return 404 if user is not found", async () => {
    mockFindUserByUsernameOrEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ usernameOrEmail: "unknown", password: "password" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });

  it("should return 401 if password is invalid", async () => {
    mockFindUserByUsernameOrEmail.mockResolvedValue(fakeUser);
    mockComparePw.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ usernameOrEmail: "jessedancr", password: "wrongPassword" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Password");
  });

  it("Should return 200 and tokens if login successfull", async () => {
    mockFindUserByUsernameOrEmail.mockResolvedValue(fakeUser);
    mockComparePw.mockResolvedValue(true);
    mockGenerateAccessToken.mockResolvedValue("accessToken");
    mockGenerateRefreshToken.mockResolvedValue("refreshToken");
    mockHashRefreshToken.mockResolvedValue("hashedRefreshToken");
    mockFindUserAndUpdate.mockResolvedValue(fakeUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ usernameOrEmail: "jessedancr", password: "password" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken", "accessToken");
    expect(res.body).toHaveProperty("refreshToken", "refreshToken");
  });

  it("Should return 500 if server error occurs", async () => {
    mockFindUserByUsernameOrEmail.mockRejectedValue(
      new Error("Internal server error")
    );

    const res = await request(app)
      .post("/api/auth/login")
      .send({ usernameOrEmail: "jessedancr", password: "password" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "internal server error");
  });
});
