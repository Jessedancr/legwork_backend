import request from "supertest";
import { jest } from "@jest/globals";
import createApp from "../app";

// * This replaces all the funcs in this module with a fake one
jest.mock("../core/configs/utils");
jest.mock("../core/middlewares/passportStrats/authjwt.middleware", () => {
  const mockAuthMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { id: "123" };
    next();
  });

  return {
    passportJWTStrat: () => jest.fn(),
    passportRefreshStrat: () => jest.fn(),
    clientOnly: () => jest.fn(),
    authMiddleware: mockAuthMiddleware,
  };
});

// * Import these modules AFTER you create mock for them
import * as utils from "../core/configs/utils";
import * as authMiddlewareModule from "../core/middlewares/passportStrats/authjwt.middleware";
const app = createApp("../core/configs/utils");

// * Mock funcs from utils.ts
const mockFindUserById = jest.mocked(utils.findUserById);
const mockAuthMiddleware = authMiddlewareModule.authMiddleware as jest.Mock;

describe("GET /:userId/get-user-details", () => {
  const fakeDancer = {
    id: "123",
    username: "jessedancr",
    email: "jesseikemefuna@gmail.com",
    firstName: "Jesse",
    lastName: "Ikemefuna",
    phoneNumber: "08166164158",
    userType: "dancer",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
  } as any;

  const fakeClient = {
    id: "123",
    username: "testClient",
    email: "testClient@gmail.com",
    firstName: "Test",
    lastName: "Client",
    phoneNumber: "08023131643",
    userType: "client",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
  } as any;
  beforeEach(() => {
    // * Reset and set default behavior to successful auth
    mockAuthMiddleware.mockClear();
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = { id: "123" };
      next();
    });
  });

  it("Should return 200 and dancer's details", async () => {
    mockFindUserById.mockResolvedValue(fakeDancer);

    const res = await request(app)
      .get("/api/users/123/get-user-details")
      .set("Authorization", "Bearer fake_token");

    expect(res.status).toBe(200);
    expect(res.body.user.userType).toBe("dancer");
    expect(mockFindUserById).toHaveBeenCalledWith("123");
    expect(res.body).toHaveProperty("message", "User's details gotten");
    expect(res.body).toHaveProperty("user");
    expect(mockFindUserById).toHaveBeenCalledTimes(1);
  });

  it("Should return 200 and client details", async () => {
    mockFindUserById.mockResolvedValue(fakeClient);

    const res = await request(app)
      .get("/api/users/123/get-user-details")
      .set("Authorization", "Bearer fake_token");

    expect(res.status).toBe(200);
    expect(res.body.user.userType).toBe("client");
    expect(mockFindUserById).toHaveBeenCalledWith("123");
    expect(res.body).toHaveProperty("message", "User's details gotten");
    expect(res.body).toHaveProperty("user");
    expect(mockFindUserById).toHaveBeenCalledTimes(1);
  });

  it("Should return 404 if user not found", async () => {
    mockFindUserById.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/users/no-user-id/get-user-details")
      .set("Authorization", "Bearer fake_token");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
    expect(res.body).not.toHaveProperty("user");
  });

  it("Should return 500 if DB error occurs", async () => {
    mockFindUserById.mockRejectedValue(console.error("Unknown DB error"));

    const res = await request(app)
      .get("/api/users/123/get-user-details")
      .set("Authorization", "Bearer fake_token");

    expect(res.status).toBe(500);
    expect(res.status).not.toHaveProperty("user");
  });

  it("Should return 401 if no JWT is provided", async () => {
    mockAuthMiddleware.mockImplementationOnce(
      (req: any, res: any, next: any) => {
        return res.status(401).json({ message: "Unauthorized" });
      }
    );
    const res = await request(app).get("/api/users/123/get-user-details");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
    expect(mockFindUserById).not.toHaveBeenCalled();
  });
});
