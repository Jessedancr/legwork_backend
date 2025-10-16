import request from "supertest";
import { jest } from "@jest/globals";
import createApp from "../app";

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
  const mockClientOnlyMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { UserType: "client" };
    next();
  });
  return {
    passportJWTStrat: () => jest.fn(),
    passportRefreshStrat: () => jest.fn(),
    clientOnly: mockClientOnlyMiddleware,
    authMiddleware: mockAuthMiddleware,
    dancerOnly: mockDancerOnlyMiddleware,
  };
});

import * as utils from "../core/configs/utils";
import * as authMiddlewareModule from "../core/middlewares/passportStrats/authjwt.middleware";

const app = createApp("../core/configs/utils");

const mockAuthMiddleware = authMiddlewareModule.authMiddleware as jest.Mock;
const mockDancerOnlyMiddleware = authMiddlewareModule.dancerOnly as jest.Mock;
const mockClientOnlyMiddleware = authMiddlewareModule.clientOnly as jest.Mock;
const mockSaveJobApplication = jest.mocked(utils.saveJobApplication);
const mockFetchApplicationsByJobId = jest.mocked(
  utils.fetchApplicationsByJobId
);
const mockFetchApplicationsByDancerId = jest.mocked(
  utils.fetchApplicationsByDancerId
);
const mockUpdateAppStatus = jest.mocked(utils.updateApplicationStatus);

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

describe("GET /api/job-applications/:jobId/applications", () => {
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
        userType: "client",
      };
      next();
    });
  });
  describe("Return applications for a job ID", () => {
    it("Should return applications for a specific job", async () => {
      mockFetchApplicationsByJobId.mockResolvedValue([fakeApplication]);
      const res = await mockFetchApplicationsByJobId("job123", "client123");
      expect(res).toEqual([fakeApplication]);
    });
  });

  it("Should return 200 with all applications for a job", async () => {
    mockFetchApplicationsByJobId.mockResolvedValue([fakeApplication]);
    const res = await request(app).get(
      "/api/job-applications/job123/applications"
    );
    expect(res.status).toBe(200);
  });

  it("Should return 404 if no applications exists for the job", async () => {
    mockFetchApplicationsByJobId.mockResolvedValue(null);
    mockFetchApplicationsByJobId.mockResolvedValue([]);
    const res = await request(app).get(
      "/api/job-applications/job123/applications"
    );
    expect(res.status).toBe(404);
  });

  it("Should return 500 if server error occurs", async () => {
    mockFetchApplicationsByJobId.mockRejectedValue("Unknown server error");
    const res = await request(app).get(
      "/api/job-applications/job123/applications"
    );
    expect(res.status).toBe(500);
  });
});

describe("GET /api/job-applications/get-dancer-applications", () => {
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
  describe("Return applications for a dancer", () => {
    it("Should return applications for a specific dancer", async () => {
      mockFetchApplicationsByDancerId.mockResolvedValue([fakeApplication]);
      const res = await mockFetchApplicationsByDancerId("dancer123");
      expect(res).toEqual([fakeApplication]);
    });
  });
  it("Should return 200 with all applications for a dancer", async () => {
    mockFetchApplicationsByDancerId.mockResolvedValue([fakeApplication]);
    const res = await request(app).get(
      "/api/job-applications/get-dancer-applications"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("appsWithJobs");
  });

  it("Should return 404 if there are no applications for the dancer", async () => {
    mockFetchApplicationsByDancerId.mockResolvedValue(null);
    mockFetchApplicationsByDancerId.mockResolvedValue([]);
    const res = await request(app).get(
      "/api/job-applications/get-dancer-applications"
    );

    expect(res.status).toBe(404);
  });

  it("Should return 500 if server error occurs", async () => {
    mockFetchApplicationsByDancerId.mockRejectedValue("Unknown server error");
    const res = await request(app).get(
      "/api/job-applications/get-dancer-applications"
    );

    expect(res.status).toBe(500);
  });

  it("Should return 403 if user is not a dancer", async () => {
    mockDancerOnlyMiddleware.mockImplementationOnce(
      (req: any, res: any, next: any) => {
        req.user = { userType: "client" };
        next();
        return res.status(403).json({ message: "Forbidden" });
      }
    );
    const res = await request(app).get(
      "/api/job-applications/get-dancer-applications"
    );
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/job-applications/:appId/accept-app", () => {
  const fakeApplication = {
    _id: "123",
    dancerId: "dancer123",
    jobId: "job123",
    clientId: "client123",
    proposal: "Hire me now because I am the best dancer on the planet",
    applicationStatus: "accepted",
  } as any;
  beforeEach(() => {
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: "123",
      };
      next();
    });
    mockClientOnlyMiddleware.mockImplementation(
      (req: any, res: any, next: any) => {
        req.user = { userType: "client" };
        next();
      }
    );
  });
  describe("Accept job application", () => {
    it("Should accept a job application", async () => {
      const appId = "app123" as any;
      mockUpdateAppStatus.mockResolvedValue(fakeApplication);
      const res = await mockUpdateAppStatus(appId, "accepted");
      expect(res).toEqual(fakeApplication);
    });
  });

  it("Should return 200 with the accepted application", async () => {
    mockUpdateAppStatus.mockResolvedValue(fakeApplication);
    const res = await request(app)
      .patch("/api/job-applications/123/accept-app")
      .send({ applicationStatus: "accepted" });
    expect(res.status).toBe(200);
  });

  it("Should return 404 if application is not found", async () => {
    mockUpdateAppStatus.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/job-applications/123/accept-app")
      .send({ applicationStatus: "accepted" });
    expect(res.status).toBe(404);
  });

  it("Should return 500 if server error occurs", async () => {
    mockUpdateAppStatus.mockRejectedValue("Unknown server error");
    const res = await request(app).patch(
      "/api/job-applications/123/accept-app"
    );
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/job-applications/:appId/reject-app", () => {
  const fakeApplication = {
    _id: "123",
    dancerId: "dancer123",
    jobId: "job123",
    clientId: "client123",
    proposal: "Hire me now because I am the best dancer on the planet",
    applicationStatus: "rejected",
  } as any;
  beforeEach(() => {
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: "123",
      };
      next();
    });
    mockClientOnlyMiddleware.mockImplementation(
      (req: any, res: any, next: any) => {
        req.user = { userType: "client" };
        next();
      }
    );
  });
  describe("Reject job application", () => {
    it("Should reject a job application", async () => {
      const appId = "app123" as any;
      mockUpdateAppStatus.mockResolvedValue(fakeApplication);
      const res = await mockUpdateAppStatus(appId, "rejected");
      expect(res).toEqual(fakeApplication);
    });
  });

  it("Should return 200 with the rejected application", async () => {
    mockUpdateAppStatus.mockResolvedValue(fakeApplication);
    const res = await request(app)
      .patch("/api/job-applications/123/reject-app")
      .send({ applicationStatus: "rejected" });
    expect(res.status).toBe(200);
  });

  it("Should return 404 if application is not found", async () => {
    mockUpdateAppStatus.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/job-applications/123/reject-app")
      .send({ applicationStatus: "rejected" });
    expect(res.status).toBe(404);
  });

  it("Should return 500 if server error occurs", async () => {
    mockUpdateAppStatus.mockRejectedValue("Unknown server error");
    const res = await request(app).patch(
      "/api/job-applications/123/reject-app"
    );
    expect(res.status).toBe(500);
  });
});
