import request from "supertest";
import { jest } from "@jest/globals";
import createApp from "../app";

jest.mock("../core/configs/utils");
jest.mock("../core/middlewares/passportStrats/authjwt.middleware", () => {
  const mockAuthMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { id: "123" };
    next();
  });
  return {
    passportJWTStrat: () => jest.fn(),
    passportRefreshStrat: () => jest.fn(),
    authMiddleware: mockAuthMiddleware,
  };
});
jest.mock("../features/auth/models/user.schema", () => {
  return {
    dancerModel: { findById: jest.fn() },
    clientModel: { findById: jest.fn() },
  };
});

import * as utils from "../core/configs/utils";
import * as authMiddlewareModule from "../core/middlewares/passportStrats/authjwt.middleware";
import { dancerModel, clientModel } from "../features/auth/models/user.schema";

const mockDancerModel = jest.mocked(dancerModel);
const mockClientModel = jest.mocked(clientModel);
const app = createApp("../core/configs/utils");

const mockSaveJob = jest.mocked(utils.saveJob);
const mockAuthMiddleware = authMiddlewareModule.authMiddleware as jest.Mock;
const mockFindUserById = jest.mocked(utils.findUserById);
const mockFetchAllJobs = jest.mocked(utils.fetchAllJobs);
const mockFetchJobsByClientId = jest.mocked(utils.fetchJobsByClientId);
const mockUpdateJobStatus = jest.mocked(utils.updateJobStatus);

describe("POST /api/jobs/create-job", () => {
  const fakeJob = {
    _id: "456",
    jobTitle: "Title",
    jobLocation: "Location",
    prefDanceStyles: ["Afro", "Hiphop"],
    pay: "70,000",
    amtOfDancers: "20",
    jobDuration: "1 day",
    jobDescr: "Descr",
    jobType: "Job type",
    clientId: "123",
    status: true,
  } as any;

  it("Should return 400 if there are validation errors", async () => {
    const res = await request(app)
      .post("/api/jobs/create-job")
      .set("Authorization", "Bearer fake_token")
      .send({ jobTitle: "abc" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("Should return 201 if job saved", async () => {
    mockSaveJob.mockResolvedValue(fakeJob);
    const res = await request(app)
      .post("/api/jobs/create-job")
      .send({
        jobTitle: "Job title",
        pay: "70,000",
        amtOfDancers: "20",
        jobDuration: "1 day",
        jobLocation: "Ikorodu",
        prefDanceStyles: ["Hiphop", "Afro"],
        jobType: "Job type",
        jobDescr:
          "This is my job description. Hopefully it is more than 20 characters",
        status: false,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("job");
  });

  it("Should return 500 if server error occurs", async () => {
    mockSaveJob.mockRejectedValue("Unknown server error");

    const res = await request(app)
      .post("/api/jobs/create-job")
      .send({
        jobTitle: "Job title",
        pay: "70,000",
        amtOfDancers: "20",
        jobDuration: "1 day",
        jobLocation: "Ikorodu",
        prefDanceStyles: ["Hiphop", "Afro"],
        jobType: "Job type",
        jobDescr:
          "This is my job description. Hopefully it is more than 20 characters",
        status: false,
      });

    expect(res.status).toBe(500);
  });

  it("Should return 401 if user is not authenticated", async () => {
    mockAuthMiddleware.mockImplementationOnce(
      (req: any, res: any, next: any) => {
        return res.status(401).json({ message: "unauthorized" });
      }
    );

    const res = await request(app)
      .post("/api/jobs/create-job")
      .send({
        jobTitle: "Job title",
        pay: "70,000",
        amtOfDancers: "20",
        jobDuration: "1 day",
        jobLocation: "Ikorodu",
        prefDanceStyles: ["Hiphop", "Afro"],
        jobType: "Job type",
        jobDescr:
          "This is my job description. Hopefully it is more than 20 characters",
        status: false,
      });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/jobs/fetch-jobs - CLIENT", () => {
  const fakeJob = {
    _id: "456",
    jobTitle: "Title",
    jobLocation: "Location",
    prefDanceStyles: ["Afro", "Hiphop"],
    pay: "70,000",
    amtOfDancers: "20",
    jobDuration: "1 day",
    jobDescr: "Descr",
    jobType: "Job type",
    clientId: "123",
    status: true,
  } as any;
  beforeEach(() => {
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: "123",
        userType: "client",
      };
      next();
    });
  });

  describe("Return jobs", () => {
    it("Should return jobs with a specified clientId", async () => {
      mockFetchJobsByClientId.mockResolvedValue([fakeJob]);

      const result = await mockFetchJobsByClientId("123");

      expect(result).toEqual([fakeJob]);
    });
  });

  it("should return 200 with jobs that the client has posted", async () => {
    mockFetchJobsByClientId.mockResolvedValue([fakeJob]);
    const res = await request(app).get("/api/jobs/fetch-jobs");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("jobs");
  });

  it("Should return 404 if client has not created any job", async () => {
    mockFetchJobsByClientId.mockResolvedValue(null);
    const res = await request(app).get("/api/jobs/fetch-jobs");
    console.log("BODY: ", res.body);
    expect(res.status).toBe(404);
  });

  it("Should return 500 if server error occurs", async () => {
    mockFetchJobsByClientId.mockRejectedValue("Unknown server error");
    const res = await request(app).get("/api/jobs/fetch-jobs");
    expect(res.status).toBe(500);
  });
});

describe("GET /api/jobs/fetch-jobs - DANCER", () => {
  const fakeJob = {
    _id: "456",
    jobTitle: "Title",
    jobLocation: "Location",
    prefDanceStyles: ["Afro", "Hiphop"],
    pay: "70,000",
    amtOfDancers: "20",
    jobDuration: "1 day",
    jobDescr: "Descr",
    jobType: "Job type",
    clientId: "123",
    status: true,
  } as any;
  beforeEach(() => {
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: "123",
        userType: "dancer",
      };
      next();
    });
  });
  describe("Return jobs", () => {
    it("Should return all jobs", async () => {
      mockFetchAllJobs.mockResolvedValue([fakeJob]);
      const result = await mockFetchAllJobs();
      expect(result).toEqual([fakeJob]);
    });
  });

  it("should return 200 with all jobs", async () => {
    mockFetchAllJobs.mockResolvedValue([fakeJob]);
    const res = await request(app).get("/api/jobs/fetch-jobs");
    expect(res.status).toBe(200);
  });
  it("Should return 404 if no jobs exist", async () => {
    mockFetchAllJobs.mockResolvedValue(null);
    const res = await request(app).get("/api/jobs/fetch-jobs");
    expect(res.status).toBe(404);
  });
  it("Should return 500 if server error occurs", async () => {
    mockFetchAllJobs.mockRejectedValue("Unknown server error");
    const res = await request(app).get("/api/jobs/fetch-jobs");
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/jobs/:jobId/change-status - CLIENT", () => {
  const fakeJob = {
    _id: "456",
    clientId: "123",
    status: false,
  } as any;
  it("Should return 200 with changed job status", async () => {
    mockUpdateJobStatus.mockResolvedValue(fakeJob);
    const res = await request(app)
      .patch("/api/jobs/456/change-status")
      .send({ status: false });

    expect(res.status).toBe(200);
  });

  it("Should return 404 if job ID is not found", async () => {
    mockUpdateJobStatus.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/jobs/no-job-id/change-status")
      .send({ status: false });

    expect(res.status).toBe(404);
  });

  it("Should return 500 if server error occurs", async () => {
    mockUpdateJobStatus.mockRejectedValue("Unknown server error");
    const res = await request(app)
      .patch("/api/jobs/456/change-status")
      .send({ status: false });
    expect(res.status).toBe(500);
  });
});
