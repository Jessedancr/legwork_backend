import request from "supertest";
import { jest } from "@jest/globals";
import createApp from "../app";

// * This replaces all the funcs in this module with a fake one
jest.mock("../core/configs/utils");

// * Pasport auth middleware
jest.mock("../core/middlewares/passportStrats/authjwt.middleware", () => {
  const mockAuthMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { id: "123" };
    next();
  });
  const mockDancerOnlyMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { userType: "dancer" };
    next();
  });
  const mockClientOnlyMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { UserType: "client" };
    next();
  });

  return {
    passportJWTStrat: () => jest.fn(),
    passportRefreshStrat: () => jest.fn(),
    clientOnly: mockClientOnlyMiddleware,
    dancerOnly: mockDancerOnlyMiddleware,
    authMiddleware: mockAuthMiddleware,
  };
});

// * Upload middleware - Mock the entire module
jest.mock("../core/middlewares/upload.middleware", () => {
  const mockSingle = jest.fn(() => {
    return (req: any, res: any, next: any) => {
      // default: simulate a provided file
      req.file = { buffer: Buffer.from("fake"), originalname: "fake.png" };
      next();
    };
  });
  return {
    __esModule: true,
    default: { single: mockSingle },
  };
});

// * Import these modules AFTER you create mock for them
import * as utils from "../core/configs/utils";
import * as authMiddlewareModule from "../core/middlewares/passportStrats/authjwt.middleware";
import upload from "../core/middlewares/upload.middleware";

const app = createApp("../core/configs/utils");

// * Mock funcs from utils.ts
const mockFindUserById = jest.mocked(utils.findUserById);
const mockFindUserAndUpdate = jest.mocked(utils.findUserAndUpdate);
const mockAuthMiddleware = authMiddlewareModule.authMiddleware as jest.Mock;
const mockUploadToCloudinary = jest.mocked(utils.uploadToCloudinary);
const mockSingle = jest.mocked(upload.single);

describe("GET /api/users/:userId/get-user-details", () => {
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
    mockFindUserById.mockRejectedValue(console.log("Unknown DB error"));

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

describe("PATCH /api/users/:userId/update-user-details", () => {
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

  beforeEach(() => {
    // * Reset and set default behavior to successful auth
    mockAuthMiddleware.mockClear();
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = { id: "123" };
      next();
    });
  });

  it("Should return 200 if user details is updated successfully", async () => {
    mockFindUserAndUpdate.mockResolvedValue(fakeDancer);

    const res = await request(app)
      .patch("/api/users/123/update-user-details")
      .set("Authorization", "Bearer fake_token")
      .send({
        username: "jessethedev",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User details updated");
  });

  it("Should return 404 if user not found", async () => {
    mockFindUserAndUpdate.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/users/123/update-user-details")
      .set("Authorization", "Bearer fake_token")
      .send({
        username: "jessethedev",
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty(
      "message",
      "User not found with the provided ID"
    );
  });

  it("Should return 400 if there is no userID", async () => {
    mockFindUserAndUpdate.mockResolvedValue(null);
    const userId = "";
    const res = await request(app)
      .patch(`/api/users/${userId}/update-user-details`)
      .set("Authorization", "Bearer fake_token")
      .send({
        username: "jessethedev",
      });

    expect(res.status).toBe(404);
  });

  it("Should return 500 when server error occurs", async () => {
    mockFindUserAndUpdate.mockRejectedValue("error updating user details");

    const res = await request(app)
      .patch("/api/users/123/update-user-details")
      .set("Authorization", "Bearer fake_token")
      .send({
        username: "jessethedev",
      });

    expect(res.status).toBe(500);
  });
});
