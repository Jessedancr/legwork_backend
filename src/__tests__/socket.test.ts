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


});
