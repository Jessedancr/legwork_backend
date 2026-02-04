import { Server } from "socket.io";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { createServer } from "http";
jest.mock("../socket");
import { initializeSocket } from "../socket";
const mockInitSocket = jest.mocked(initializeSocket);

describe("Socket.IO Tests", () => {
  let io: any;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let httpServer: any;
  let port: number;

  beforeAll(async () => {
    // * Create HTTP server
    httpServer = createServer();
    io = new Server(httpServer);
    mockInitSocket(io);

    await new Promise<void>((res, rej) => {
      httpServer.listen(() => {
        port = httpServer.address().port;
        console.log("ADDRES: ", httpServer.address());
        console.log("LISTENING ON PORT:...", port);
        res();
      });
      httpServer.on("error", (err: any) => rej(err));
    });
  });

  afterAll(async () => {
    io.close();
    await new Promise((res, rej) => {
      httpServer.close((err: any) => {
        if (err) rej(err);
        else res("");
      });
    });
  });

  beforeEach(async () => {
    const connectSocket = (url: string): Promise<ClientSocket> => {
      return new Promise<ClientSocket>((res, rej) => {
        const socket: ClientSocket = Client(url);
        socket.on("connect", () => res(socket));
        socket.on("connect_error", (err) => rej(err));
      });
    };
    clientSocket1 = await connectSocket(`http://localhost:${port}`);
    clientSocket2 = await connectSocket(`http://localhost:${port}`);
  });

  afterEach(() => {
    clientSocket1.disconnect();
    clientSocket2.disconnect();
  });

  describe("User Connection", () => {
    it("should connect successfully", async () => {
      expect(clientSocket1.connected).toBe(true);
    });

    it("should handle user-join event", async () => {
      const userId = "user123";

      clientSocket2.on("user-online", (data) => {
        expect(data.userId).toBe(userId);
        expect(data.socketId).toBeDefined();
      });

      clientSocket1.emit("user-join", userId);
    });

    it("should handle user disconnect", async () => {
      const userId = "user456";

      clientSocket2.on("user-offline", (data) => {
        expect(data.userId).toBe(userId);
      });

      clientSocket1.emit("user-join", userId);

      setTimeout(() => {
        clientSocket1.disconnect();
      }, 100);
    });
  });

  //   describe("Chat Room Operations", () => {
  //     test("should join chatroom successfully", (done) => {
  //       const roomId = "room123";
  //       const userId = "user789";

  //       clientSocket1.emit("join-chatroom", { roomId, userId });

  //       // If no error occurs within 500ms, consider it successful
  //       setTimeout(() => {
  //         done();
  //       }, 500);
  //     });

  //     test("should leave chatroom successfully", (done) => {
  //       const roomId = "room456";
  //       const userId = "user101";

  //       clientSocket1.emit("join-chatroom", { roomId, userId });

  //       setTimeout(() => {
  //         clientSocket1.emit("leave-chatroom", { roomId, userId });
  //         done();
  //       }, 100);
  //     });
  //   });

  //   * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //   describe("Messaging", () => {
  //     test("should send and receive messages in chatroom", (done) => {
  //       const chatRoomId = "testroom1";
  //       const messageContent = "Test message";

  //       // Both clients join the same room
  //       clientSocket1.emit("join-chatroom", { roomId: chatRoomId, userId: "sender" });
  //       clientSocket2.emit("join-chatroom", { roomId: chatRoomId, userId: "receiver" });

  //       clientSocket2.on("receive-message", (data) => {
  //         expect(data.content).toBe(messageContent);
  //         expect(data.chatRoomId).toBe(chatRoomId);
  //         expect(data.sender.id).toBe("sender");
  //         expect(data.sender.userType).toBe("dancer");
  //         done();
  //       });

  //       setTimeout(() => {
  //         clientSocket1.emit("send-message", {
  //           chatRoomId,
  //           senderId: "sender",
  //           senderType: "dancer",
  //           content: messageContent,
  //         });
  //       }, 100);
  //     });

  //     test("should send notification to offline room member", (done) => {
  //       const chatRoomId = "testroom2";

  //       // Only sender joins the room
  //       clientSocket1.emit("join-chatroom", { roomId: chatRoomId, userId: "sender" });
  //       // Receiver is online but not in room
  //       clientSocket2.emit("user-join", "receiver");

  //       clientSocket2.on("new-message-notification", (data) => {
  //         expect(data.chatRoomId).toBe(chatRoomId);
  //         expect(data.senderId).toBe("sender");
  //         expect(data.messagePreview).toBeDefined();
  //         done();
  //       });

  //       setTimeout(() => {
  //         clientSocket1.emit("send-message", {
  //           chatRoomId,
  //           senderId: "sender",
  //           senderType: "dancer",
  //           content: "Notification test message",
  //         });
  //       }, 100);
  //     });

  //     test("should update message status", (done) => {
  //       const roomId = "statusroom";
  //       const messageId = "msg123";

  //       clientSocket1.emit("join-chatroom", { roomId, userId: "user1" });
  //       clientSocket2.emit("join-chatroom", { roomId, userId: "user2" });

  //       clientSocket2.on("message-status-updated", (data) => {
  //         expect(data.messageId).toBe(messageId);
  //         expect(data.status).toBe("read");
  //         done();
  //       });

  //       setTimeout(() => {
  //         clientSocket1.emit("update-message-status", {
  //           messageId,
  //           status: "read",
  //           roomId,
  //         });
  //       }, 100);
  //     });
  //   });

  //   * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //   describe("Typing Indicators", () => {
  //     test("should broadcast typing indicator", (done) => {
  //       const roomId = "typingroom";
  //       const userId = "typer";
  //       const username = "John Doe";

  //       clientSocket1.emit("join-chatroom", { roomId, userId: "user1" });
  //       clientSocket2.emit("join-chatroom", { roomId, userId });

  //       clientSocket1.on("user-typing", (data) => {
  //         expect(data.userId).toBe(userId);
  //         expect(data.username).toBe(username);
  //         done();
  //       });

  //       setTimeout(() => {
  //         clientSocket2.emit("user-typing", { roomId, userId, username });
  //       }, 100);
  //     });

  //     test("should broadcast stop typing indicator", (done) => {
  //       const roomId = "typingstoproom";
  //       const userId = "stopper";

  //       clientSocket1.emit("join-chatroom", { roomId, userId: "user1" });
  //       clientSocket2.emit("join-chatroom", { roomId, userId });

  //       clientSocket1.on("user-typing-stop", (data) => {
  //         expect(data.userId).toBe(userId);
  //         done();
  //       });

  //       setTimeout(() => {
  //         clientSocket2.emit("user-typing-stop", { roomId, userId });
  //       }, 100);
  //     });

  //     test("should stop typing when user joins room", (done) => {
  //       const roomId = "autostoproom";
  //       const userId = "autoStopper";

  //       clientSocket1.emit("join-chatroom", { roomId, userId: "existing" });

  //       clientSocket1.on("user-stop-typing", (data) => {
  //         expect(data.userId).toBe(userId);
  //         done();
  //       });

  //       setTimeout(() => {
  //         clientSocket2.emit("join-chatroom", { roomId, userId });
  //       }, 100);
  //     });
  //   });

  //   * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //   describe("Error Handling", () => {
  //     test("should handle message send error gracefully", (done) => {
  //       clientSocket1.on("message-error", (data) => {
  //         expect(data.message).toBe("Failed to send message");
  //         done();
  //       });

  //       // Send invalid message (will fail due to DB constraint)
  //       clientSocket1.emit("send-message", {
  //         chatRoomId: "invalid",
  //         senderId: "",
  //         senderType: "dancer",
  //         content: "",
  //       });

  //       setTimeout(done, 1000); // Timeout if no error is emitted
  //     });
  //   });
});
