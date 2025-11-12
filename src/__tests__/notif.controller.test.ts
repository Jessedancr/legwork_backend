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
    clientOnly: () => jest.fn(),
    authMiddleware: mockAuthMiddleware,
    dancerOnly: () => jest.fn(),
  };
});

import * as utils from "../core/configs/utils";
import * as authMiddlewareModule from "../core/middlewares/passportStrats/authjwt.middleware";

const app = createApp("../core/configs/utils");

const mockAuthMiddleware = authMiddlewareModule.authMiddleware as jest.Mock;
const mockSendNotificationToDevice = jest.mocked(
  utils.sendNotificationToDevice
);

describe("POST /api/notif/send-notif", () => {
  const fakeNotif = {
    title: "Fake Notif Title",
    body: "Fake Notif Body",
    deviceToken: "FakeDeviceToken",
  } as any;

  beforeEach(() => {
    mockAuthMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: "123",
      };
      next();
    });
  });

  it("Should return 400 if there is no device token", async () => {
    mockSendNotificationToDevice.mockResolvedValue(fakeNotif);
    const res = await request(app)
      .post("/api/notif/send-notif")
      .send({ title: "Fake Notif Title", body: "Fake Notif Body" });

    expect(res.status).toBe(400);
  });

  it("Should return 200", async () => {
    mockSendNotificationToDevice.mockResolvedValue(fakeNotif);
    const res = await request(app).post("/api/notif/send-notif").send({
      title: "Fake Notif Title",
      body: "Fake Notif Body",
      deviceToken: "FakeDeviceToken",
    });

    expect(res.status).toBe(200);
  });

  it("Should return 500 if server error occurs", async () => {
    mockSendNotificationToDevice.mockRejectedValue(null);
    const res = await request(app).post("/api/notif/send-notif");

    expect(res.status).toBe(500);
  });
});
