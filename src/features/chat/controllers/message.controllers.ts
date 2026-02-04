import { Request, Response } from "express";
import { makeChatRoom } from "../../../core/configs/utils";
import { chatRoomModel, messageModel } from "../models/chat.schema";
import MessageStatus from "../../../core/enums/messageStatusEnum";

type createChatRoomReqBody = {
  dancerId: string;
  clientId: string;
};

/**
 * Create or get existing chat room between dancer and client
 */
export async function createChatRoom(
  req: Request<{}, {}, createChatRoomReqBody>,
  res: Response,
) {
  try {
    const { dancerId, clientId } = req.body;
    const roomId = `${dancerId}_${clientId}`;
    console.log("Generated room ID: ", roomId);

    // Check if chat room already exists
    const chatRoom = await makeChatRoom(roomId, dancerId, clientId);

    res.status(200).json({
      message: "Chat room ready",
      chatRoom,
    });
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get all chat rooms for the authenticated user
 */
// export async function getChatRooms(req: Request, res: Response) {
//   try {
//     const userId = req.user?.id;
//     const userType = req.user?.userType;

//     let chatRooms;
//     if (userType === "dancer") {
//       chatRooms = await chatRoomModel
//         .find({ dancer: userId })
//         .populate("client", "firstName lastName username profilePicture")
//         .sort({ lastMessageTime: -1 });
//     } else if (userType === "client") {
//       chatRooms = await chatRoomModel
//         .find({ client: userId })
//         .populate("dancer", "firstName lastName username profilePicture")
//         .sort({ lastMessageTime: -1 });
//     } else {
//       return res.status(400).json({ message: "Invalid user type" });
//     }

//     res.status(200).json({
//       message: "Chat rooms retrieved successfully",
//       chatRooms,
//     });
//   } catch (error) {
//     console.error("Error getting chat rooms:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// /**
//  * Get message history for a specific chat room
//  */
// export async function getMessages(req: Request, res: Response) {
//   try {
//     const { chatRoomId } = req.params;
//     const userId = req.user?.id;
//     const userType = req.user?.userType;
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;
//     const skip = (page - 1) * limit;

//     // Verify chat room exists and user has access
//     const chatRoom = await chatRoomModel.findById(chatRoomId);
//     if (!chatRoom) {
//       return res.status(404).json({ message: "Chat room not found" });
//     }

//     // Check if user is part of this chat room
//     const isAuthorized =
//       (userType === "dancer" && chatRoom.dancer.toString() === userId) ||
//       (userType === "client" && chatRoom.client.toString() === userId);

//     if (!isAuthorized) {
//       return res
//         .status(403)
//         .json({ message: "Unauthorized to view messages in this chat room" });
//     }

//     // Get messages with pagination
//     const messages = await messageModel
//       .find({ chatRoom: chatRoomId })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("sender.id", "firstName lastName username profilePicture");

//     const totalMessages = await messageModel.countDocuments({
//       chatRoom: chatRoomId,
//     });
//     const totalPages = Math.ceil(totalMessages / limit);

//     res.status(200).json({
//       message: "Messages retrieved successfully",
//       messages: messages.reverse(), // Reverse to show chronological order
//       pagination: {
//         currentPage: page,
//         totalPages,
//         totalMessages,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Error getting messages:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// /**
//  * Update message status (mark as read/delivered)
//  */
// export async function updateMessageStatus(req: Request, res: Response) {
//   try {
//     const { messageId } = req.params;
//     const { status } = req.body;
//     const userId = req.user?.id;
//     const userType = req.user?.userType;

//     // Validate status
//     if (!Object.values(MessageStatus).includes(status)) {
//       return res.status(400).json({ message: "Invalid message status" });
//     }

//     // Find message and verify user has access
//     const message = await messageModel.findById(messageId).populate("chatRoom");
//     if (!message) {
//       return res.status(404).json({ message: "Message not found" });
//     }

//     const chatRoom = message.chatRoom as any;

//     // Check if user is the recipient (not the sender)
//     const isRecipient =
//       (userType === "dancer" && chatRoom.client.toString() === userId) ||
//       (userType === "client" && chatRoom.dancer.toString() === userId);

//     if (!isRecipient) {
//       return res
//         .status(403)
//         .json({ message: "Only recipients can update message status" });
//     }

//     // Update message status
//     const updatedMessage = await messageModel.findByIdAndUpdate(
//       messageId,
//       { status },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Message status updated successfully",
//       messageContent: updatedMessage,
//     });
//   } catch (error) {
//     console.error("Error updating message status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// /**
//  * Get unread message count for user
//  */
// export async function getUnreadCount(req: Request, res: Response) {
//   try {
//     const userId = req.user?.id;
//     const userType = req.user?.userType;

//     // Find all chat rooms for this user
//     let chatRooms;
//     if (userType === "dancer") {
//       chatRooms = await chatRoomModel.find({ dancer: userId });
//     } else if (userType === "client") {
//       chatRooms = await chatRoomModel.find({ client: userId });
//     } else {
//       return res.status(400).json({ message: "Invalid user type" });
//     }

//     const chatRoomIds = chatRooms.map((room) => room._id);

//     // Count unread messages (sent by others, not read)
//     const unreadCount = await messageModel.countDocuments({
//       chatRoom: { $in: chatRoomIds },
//       "sender.id": { $ne: userId },
//       status: { $ne: MessageStatus.Read },
//     });

//     res.status(200).json({
//       message: "Unread count retrieved successfully",
//       unreadCount,
//     });
//   } catch (error) {
//     console.error("Error getting unread count:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// /**
//  * Send a message via REST API (alternative to Socket.IO)
//  */
// export async function sendMessage(req: Request, res: Response) {
//   try {
//     const { chatRoomId, content } = req.body;
//     const senderId = req.user?.id;
//     const senderType = req.user?.userType;

//     if (!content || content.trim().length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Message content cannot be empty" });
//     }

//     // Verify chat room exists and user has access
//     const chatRoom = await chatRoomModel.findById(chatRoomId);
//     if (!chatRoom) {
//       return res.status(404).json({ message: "Chat room not found" });
//     }

//     // Check if user is part of this chat room
//     const isAuthorized =
//       (senderType === "dancer" && chatRoom.dancer.toString() === senderId) ||
//       (senderType === "client" && chatRoom.client.toString() === senderId);

//     if (!isAuthorized) {
//       return res
//         .status(403)
//         .json({ message: "Unauthorized to send message in this chat room" });
//     }

//     // Create message
//     const newMessage = new messageModel({
//       chatRoom: chatRoomId,
//       sender: {
//         id: senderId,
//         userType: senderType,
//       },
//       content: content.trim(),
//       status: MessageStatus.Sent,
//     });

//     await newMessage.save();

//     // Update chat room's last message
//     await chatRoomModel.findByIdAndUpdate(chatRoomId, {
//       lastMessage: content.trim(),
//       lastMessageTime: new Date(),
//     });

//     res.status(201).json({
//       message: "Message sent successfully",
//       messageContent: {
//         _id: newMessage._id,
//         chatRoom: newMessage.chatRoom,
//         sender: newMessage.sender,
//         content: newMessage.content,
//         status: newMessage.status,
//         createdAt: newMessage.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }
