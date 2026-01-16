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
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    /**
     * When user joins, store their connection in 'activeUsers' Map
     * This tracks online users
     */
    socket.on("user-join", (userId: string) => {
      // * Store the userId in activeUsers Map
      activeUsers.set(userId, socket.id);
      console.log("User", userId, "is online");
      console.log("Active users: ", Array.from(activeUsers.keys()));

      // * Notify relevant users that this person is online
      socket.emit("user-online", { userId, socketId: socket.id });
    });

    /**
     * User joins a specific chatroom
     */
    socket.on(
      "join-chatroom",
      async (data: { roomId: string; userId: string }) => {
        const { roomId, userId } = data;
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        socket.to(roomId).emit("user-stop-typing", { userId });
      }
    );

    /**
     * User leaves a chatroom
     */
    socket.on(
      "leave-chatroom",
      async (data: { roomId: string; userId: string }) => {
        const { roomId, userId } = data;
        socket.leave(roomId);
        console.log(`User ${userId} left room ${roomId}`);
      }
    );

    /**
     * Send message event
     */
    socket.on(
      "send-message",
      async (data: {
        chatRoomId: string;
        senderId: string;
        senderType: "dancer" | "client";
        content: string;
      }) => {
        try {
          const { chatRoomId, senderId, senderType, content } = data;

          const newMessage = await updateChatRoomMessage(
            chatRoomId,
            { id: senderId, userType: senderType },
            content,
            MessageStatus.Sent
          );

          // Get chatroom to determine recipient
          const chatRoom = await findChatRoom(chatRoomId);

          const recipientId =
            senderType === "dancer" ? chatRoom?.client : chatRoom?.dancer;

          // Broadcast message to room
          // ! Probably use socket.to() to avoid echoing back to the sender
          io.to(chatRoomId).emit("receive-message", {
            _id: newMessage._id,
            chatRoomId,
            sender: {
              id: senderId,
              userType: senderType,
            },
            content,
            status: MessageStatus.Sent,
            createdAt: newMessage.createdAt,
          });

          // Notify recipient even if not in room
          if (recipientId) {
            const recipientSocketId = activeUsers.get(recipientId.toString());
            if (recipientSocketId) {
              // ! Probably use socket.to() to avoid echoing back to the sender
              io.to(recipientSocketId).emit("new-message-notification", {
                chatRoomId,
                senderId,
                senderType,
                messagePreview: content.substring(0, 50),
              });
            }
          }

          console.log(`Message sent in room ${chatRoomId}`);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("message-error", { message: "Failed to send message" });
        }
      }
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
            { new: true }
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
      }
    );

    /**
     * User typing indicator
     */
    socket.on(
      "user-typing",
      async (data: { roomId: string; userId: string; username: string }) => {
        const { roomId, userId, username } = data;
        console.log(
          `User ${userId} with username ${username} is typing in room ${roomId}`
        );
        socket.to(roomId).emit("user-typing", { userId, username });
      }
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
      }
    );

    /**
     * User disconnect
     */
    socket.on("disconnect", () => {
      // Find and remove user from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId.toString()} is offline`);
          console.log(`User ${userId} is offline`);
          console.log("User", userId, "is offline");

          // Broadcast offline status
          socket.emit("user-offline", { userId });
          break;
        }
      }
    });

    /**
     * Get online users
     */
    socket.on("get-online-users", () => {
      const onlineUserIds = Array.from(activeUsers.keys());
      console.log("Online users sent to: ", socket.id);
      socket.emit("online-users-list", { onlineUsers: onlineUserIds });
      console.log(`Online users ${onlineUserIds}`);
      console.log("Online users: ", onlineUserIds);
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
export function getActiveSocketId(userId: string): string | undefined {
  return activeUsers.get(userId);
}

/**
 * Utility function to get all active users
 */
export function getActiveUsers(): string[] {
  return Array.from(activeUsers.keys());
}
