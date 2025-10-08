import request from "supertest";
import { jest } from "@jest/globals";
import createApp from "../app";
import UserType from "../core/enums/userTypeEnum";

jest.mock("../core/configs/utils");
jest.mock("../core/middlewares/passportStrats/authjwt.middleware", () => {
  const mockAuthMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { id: "123" };
    next();
  });
  const mockDancerOnlyMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { userType: "dancer" };
    next();
  });
  return {
    passportJWTStrat: () => jest.fn(),
    passportRefreshStrat: () => jest.fn(),
    clientOnly: () => jest.fn(),
    authMiddleware: mockAuthMiddleware,
    dancerOnly: mockDancerOnlyMiddleware,
  };
});

import * as utils from "../core/configs/utils";
import * as authMiddlewareModule from "../core/middlewares/passportStrats/authjwt.middleware";

const app = createApp("../core/configs/utils");

const mockAuthMiddleware = authMiddlewareModule.authMiddleware as jest.Mock;
const mockDancerOnlyMiddleware = authMiddlewareModule.dancerOnly as jest.Mock;
const mockSaveJobApplication = jest.mocked(utils.saveJobApplication);

describe("POST /api/job-applications/:jobId/apply-for-job", () => {
  const fakeApplication = {
    _id: "123",
    dancerId: "dancer123",
    jobId: "job123",
    clientId: "client123",
    proposal: "Hire me now because I am the best dancer on the planet",
  } as any;

  beforeEach(() => {
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: "123",
      };
      next();
    });
    mockDancerOnlyMiddleware.mockImplementation(
      (req: any, res: any, next: any) => {
        req.user = { userType: "dancer" };
        next();
      }
    );
  });

  it("Should return 400 if there are validation errors", async () => {
    const res = await request(app)
      .post("/api/job-applications/job123/apply-for-job")
      .send({ proposal: "Invalid proposal, too short" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("Should return 201 and job application", async () => {
    mockSaveJobApplication.mockResolvedValue({
      exists: false,
      application: fakeApplication,
    });
    const res = await request(app)
      .post("/api/job-applications/job123/apply-for-job")
      .send({
        proposal: "Hire me now because I am the best dancer in the world",
      });

    expect(res.status).toBe(201);
  });

  it("Should return 500 if server error occurs", async () => {
    mockSaveJobApplication.mockRejectedValue("Unknown server error");
    const res = await request(app)
      .post("/api/job-applications/job123/apply-for-job")
      .send({
        proposal: "Hire me now because I am the best dancer in the world",
      });
    expect(res.status).toBe(500);
  });

  it("Should return 409 if user has already applied for the job", async () => {
    mockSaveJobApplication.mockResolvedValue({
      exists: true,
      application: fakeApplication,
    });
    const res = await request(app)
      .post("/api/job-applications/job123/apply-for-job")
      .send({
        proposal: "Hire me now because I am the best dancer in the world",
      });
    expect(res.status).toBe(409);
  });

  it("Should return 403 if user is not a dancer", async () => {
    mockDancerOnlyMiddleware.mockImplementationOnce(
      (req: any, res: any, next: any) => {
        req.user = { userType: "client" };
        return res.status(403).json({ message: "Forbidden" });
      }
    );
    mockSaveJobApplication.mockResolvedValue({
      exists: false,
      application: fakeApplication,
    });
    const res = await request(app)
      .post("/api/job-applications/job123/apply-for-job")
      .send({
        proposal: "Hire me now because I am the best dancer in the world",
      });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/job-applications/:jobId/applications", () => {});
