import request from "supertest";
import createApp from "../app";

jest.mock("../core/configs/utils");
jest.mock("../core/middlewares/passportStrats/authjwt.middleware", () => {
  const mockAuthMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { id: "123" };
    next();
  });
  const mockClientOnlyMiddleware = jest.fn((req: any, res: any, next: any) => {
    req.user = { userType: "client" };
    next();
  });
  return {
    passportJWTStrat: () => jest.fn(),
    passportRefreshStrat: () => jest.fn(),
    authMiddleware: mockAuthMiddleware,
    clientOnly: () => jest.fn(),
    dancerOnly: () => jest.fn(),
  };
});

import * as utils from "../core/configs/utils";

const app = createApp("../core/configs/utils");
const mockMakeChatRoom = jest.mocked(utils.makeChatRoom);

describe("POST /api/chat/creat-chat-room", () => {
  const fakeChatRoom = {
    _id: "id123",
    roomId: "chatRoomId123",
    dancer: "dancer",
    client: "client",
    lastMessage: "lastMessage",
    lastMessageTime: "lastMessageTimr",
  } as any;

  it("Should return 200 with chat room details", async () => {
    mockMakeChatRoom.mockResolvedValue(fakeChatRoom);
    const res = await request(app)
      .post("/api/chat/create-chat-room")
      .send({ dancerId: "dancerId123", clientId: "clientId123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("chatRoom");
  });

  it("Should return 500 if server error", async () => {
    mockMakeChatRoom.mockRejectedValue("");
    const res = await request(app)
      .post("/api/chat/create-chat-room")
      .send({ dancerId: "dancer123", clientId: "client123" });

    expect(res.status).toBe(500);
  });
});
