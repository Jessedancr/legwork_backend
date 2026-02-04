import { Server, Socket } from "socket.io";
import {
  chatRoomModel,
  messageModel,
} from "./features/chat/models/chat.schema";
import MessageStatus from "./core/enums/messageStatusEnum";
import { findChatRoom, updateChatRoomMessage } from "./core/configs/utils";

// * Store active users: userId -> socketId
const activeUsers = new Map<string, string>();

/**
 * Initialize Socket.IO event handlers
 */
export function initializeSocket(io: Server) {
  io.on("connect", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    /**
     * When user joins, store their connection in 'activeUsers' Map
     * This tracks online users
     */
    socket.on("user-join", (username: string) => {
      // * Store the userId in activeUsers Map
      activeUsers.set(username, socket.id);
      console.log(username, "is online");
      console.log("Active users: ", Array.from(activeUsers.keys()));

      // * Notify relevant users that this person is online
      socket.emit("user-online", { username, socketId: socket.id });
    });

    /**
     * User joins a specific chatroom
     */
    socket.on(
      "join-chatroom",
      async (data: { roomId: string; username: string }) => {
        const { roomId, username } = data;
        socket.join(roomId);
        console.log(`${username} joined room ${roomId}`);
        socket.to(roomId).emit("user-stop-typing", { username });
      },
    );

    /**
     * User leaves a chatroom
     */
    socket.on(
      "leave-chatroom",
      async (data: { roomId: string; userId: string }) => {
        const { roomId, userId } = data;
        socket.leave(roomId);
        console.log(`${userId} left room ${roomId}`);
      },
    );

    /**
     * Send message event
     */
    socket.on(
      "send-message",
      async (data: {
        senderId: string;
        receiverId: string;
        senderType: "dancer" | "client";
        content: string;
      }) => {
        try {
          const { senderId, receiverId, senderType, content } = data;
          const roomId = `${senderId}_${receiverId}`;
          // const senderIdd = senderType === "dancer" ? dancerId : clientId;

          const newMessage = await updateChatRoomMessage(
            senderId,
            receiverId,
            { id: senderId, userType: senderType },
            content,
            MessageStatus.Sent,
          );

          // Get chatroom to determine recipient
          // const chatRoom = await findChatRoom(roomId);

          // const recipientId =
          //   senderType === "dancer" ? chatRoom?.client : chatRoom?.dancer;

          // Broadcast message to room
          // ! Probably use socket.to() to avoid echoing back to the sender
          io.to(roomId).emit("receive-message", {
            _id: newMessage._id,
            chatRoomId: roomId,
            sender: {
              id: senderId,
              userType: senderType,
            },
            content,
            status: MessageStatus.Sent,
            createdAt: newMessage.createdAt,
          });

          // Notify recipient even if not in room
          if (receiverId) {
            const recipientSocketId = activeUsers.get(receiverId.toString());
            if (recipientSocketId) {
              // ! Probably use socket.to() to avoid echoing back to the sender
              io.to(recipientSocketId).emit("new-message-notification", {
                chatRoomId: roomId,
                senderId,
                senderType,
                messagePreview: content.substring(0, 50),
              });
            }
          }

          console.log(`Message sent in room ${roomId}`);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("message-error", { message: "Failed to send message" });
        }
      },
    );

    /**
     * Update message status (read/delivered)
     */
    socket.on(
      "update-message-status",
      async (data: {
        messageId: string;
        status: MessageStatus;
        roomId: string;
      }) => {
        try {
          const { messageId, status, roomId } = data;

          // Update message status in database
          const updatedMessage = await messageModel.findByIdAndUpdate(
            messageId,
            { status },
            { new: true },
          );

          // Broadcast status update to room
          // ! Probably use socket.to() to avoid echoing back to the sender
          io.to(roomId).emit("message-status-updated", {
            messageId,
            status,
          });

          console.log(`Message ${messageId} status updated to ${status}`);
        } catch (error) {
          console.error("Error updating message status:", error);
        }
      },
    );

    /**
     * User typing indicator
     */
    socket.on(
      "user-typing",
      async (data: { roomId: string; userId: string; username: string }) => {
        const { roomId, userId, username } = data;
        console.log(
          `User ${userId} with username ${username} is typing in room ${roomId}`,
        );
        socket.to(roomId).emit("user-typing", { userId, username });
      },
    );

    /**
     * User stopped typing
     */
    socket.on(
      "user-typing-stop",
      (data: { roomId: string; userId: string }) => {
        const { roomId, userId } = data;
        socket.to(roomId).emit("user-typing-stop", {
          userId,
        });
        console.log(`User ${userId} stopped typing in room ${roomId}`);
      },
    );

    /**
     * User disconnect
     */
    socket.on("disconnect", (reason) => {
      // Find and remove user from active users
      for (const [username, socketId] of activeUsers.entries()) {
        console.log("Looping through to remove user");
        if (socketId === socket.id) {
          activeUsers.delete(username);
          console.log(`${username} is offline`);
          // Broadcast offline status
          socket.emit("user-offline", { username });
          console.log(`${username} removed via built-in disconnect: ${reason}`);

          break;
        }
      }
      socket.emit("user-offline", { reason });
      console.log(`User removed via built-in disconnect: ${reason}`);
    });

    socket.on("disconnection", (username) => {
      console.log(`${username} requested disconnect`);
      activeUsers.delete(username);
      io.emit("user-offline", { username });
    });

    /**
     * Error handler
     */
    socket.on("error", (error) => {
      console.error(`Socket error from ${socket.id}:`, error);
    });
  });

  // Handle connection errors
  io.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
}

/**
 * Utility function to get active socket ID for a user
 */
// export function getActiveSocketId(userId: string): string | undefined {
//   return activeUsers.get(userId);
// }

/**
 * Utility function to get all active users
 */
// export function getActiveUsers(): string[] {
//   return Array.from(activeUsers.keys());
// }
