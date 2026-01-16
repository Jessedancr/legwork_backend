import connectMongo from "./core/configs/connectMongo";
import createApp from "./app";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket";

const app = createApp(connectMongo());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    // credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// Initialize Socket
initializeSocket(io);


const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server started on http://localhost:${port}`);
  console.log(`Socket.IO running on port ${port}`);
});

export default app;
