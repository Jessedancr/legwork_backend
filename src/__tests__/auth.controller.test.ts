// * This replaces all the funcs in this module with a fake one
jest.mock("../core/configs/utils");
const app = createApp("../core/configs/utils");

import request from "supertest";
import { jest } from "@jest/globals";
import * as utils from "../core/configs/utils";
import createApp from "../app";

// * Mock Funcs from utils.ts
const mockFindUserByUsernameOrEmail = jest.mocked(
  utils.findUserByUsernameOrEmail
);
const mockComparePw = jest.mocked(utils.comparePasswords);
const mockGenerateAccessToken = jest.mocked(utils.generateAccessToken);
const mockGenerateRefreshToken = jest.mocked(utils.generateRefreshToken);
const mockHashData = jest.mocked(utils.hashPassword);
const mockFindUserAndUpdate = jest.mocked(utils.findUserAndUpdate);
const mockCheckUserExists = jest.mocked(utils.checkUserExists);
const mockSaveDancer = jest.mocked(utils.saveDancer);
const mockSaveClient = jest.mocked(utils.saveClient);

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
    mockHashData.mockResolvedValue("hashedRefreshToken");
    mockFindUserAndUpdate.mockResolvedValue(fakeUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ usernameOrEmail: "jessedancr", password: "password" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken", "accessToken");
    expect(res.body).toHaveProperty("refreshToken", "refreshToken");
  });

  it("Should return 500 if server error occurs", async () => {
    mockFindUserByUsernameOrEmail.mockRejectedValue("Internal server error");

    const res = await request(app)
      .post("/api/auth/login")
      .send({ usernameOrEmail: "jessedancr", password: "password" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "internal server error");
  });
});

describe("POST api/auth/signup", () => {
  let fakeUser: any;

  // * Before each test, clear all mocks
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset fakeUser to its original state
    fakeUser = {
      id: "123",
      firstName: "Jesse",
      lastName: "Ikemefuna",
      email: "jesseikemefuna@gmail.com",
      phoneNumber: "08166164158",
      userType: "dancer",
      username: "jessedancr",
      password: "password",
      password2: "password",
    } as any;
  });

  it("Should return 201 if user created successfully", async () => {
    mockHashData.mockResolvedValue("hashedPass");
    mockCheckUserExists.mockResolvedValue({ exists: false });
    mockSaveDancer.mockResolvedValue(fakeUser);
    mockGenerateAccessToken.mockResolvedValue("accessToken");
    mockGenerateRefreshToken.mockResolvedValue("refreshToken");
    mockHashData.mockResolvedValue("hashedRefreshToken");
    mockFindUserAndUpdate.mockResolvedValue(fakeUser);

    const res = await request(app).post("/api/auth/signup").send({
      firstName: "Jesse",
      lastName: "Ikemefuna",
      email: "jesseikemefuna@gmail.com",
      phoneNumber: "08166164158",
      userType: "dancer",
      username: "jessedancr",
      password: "password",
      password2: "password",
    });

    expect(res.status).toBe(201);
  });

  it("Should return 400 if user already exists with username", async () => {
    mockHashData.mockResolvedValue("hashedPass");
    mockCheckUserExists.mockResolvedValue({
      exists: true,
      field: "username",
    });

    const { id, ...newFakeUser } = fakeUser;

    const res = await request(app).post("/api/auth/signup").send(newFakeUser);

    expect(res.status).toBe(400);
  });

  it("Should return 400 if user already exists with email", async () => {
    mockHashData.mockResolvedValue("hashedPass");
    mockCheckUserExists.mockResolvedValue({
      exists: true,
      field: "email",
    });

    const { id, ...newFakeUser } = fakeUser;

    const res = await request(app).post("/api/auth/signup").send(newFakeUser);

    expect(res.status).toBe(400);
  });

  it("Should return 400 if the user already exists with the phone number", async () => {
    mockHashData.mockResolvedValue("hashedPass");
    mockCheckUserExists.mockResolvedValue({
      exists: true,
      field: "phoneNumber",
    });

    const { id, ...newFakeUser } = fakeUser;

    const res = await request(app).post("/api/auth/signup").send(newFakeUser);

    expect(res.status).toBe(400);
  });

  it("Should return 400 if the user type is invalid", async () => {
    mockHashData.mockResolvedValue("hashedPass");
    mockCheckUserExists.mockResolvedValue({ exists: false });

    fakeUser.userType = "unknownUserType";
    const { id, ...newFakeUser } = fakeUser;

    const res = await request(app).post("/api/auth/signup").send(newFakeUser);

    expect(res.status).toBe(400);
  });

  it("Should return 400 if passwords do not match", async () => {
    fakeUser.password2 = "wrongPass2";
    const { id, ...newFakeUser } = fakeUser;

    const res = await request(app).post("/api/auth/signup").send(newFakeUser);

    expect(res.status).toBe(400);
  });

  it("Should return 500 if server error occurs", async () => {
    const { id, ...newFakeUser } = fakeUser;
    mockHashData.mockRejectedValue("Internal server error");
    mockCheckUserExists.mockRejectedValue("Internal server error");
    mockSaveDancer.mockRejectedValue("Internal server error");
    const res = await request(app).post("/api/auth/signup").send(newFakeUser);

    expect(res.status).toBe(500);
  });
});
