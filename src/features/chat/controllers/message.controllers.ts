import { Request, Response } from "express";
import { makeChatRoom } from "../../../core/configs/utils";

type createChatRoomReqBody = {
  dancerId: string;
  clientId: string;
};

/**
 * Create or get existing chat room between dancer and client
 */
export async function createChatRoom(
  req: Request<{}, {}, createChatRoomReqBody>,
  res: Response
) {
  try {
    const { dancerId, clientId } = req.body;

    // Generate room ID
    const roomId = `${dancerId}_${clientId}`;
    console.log("Generated room ID: ", roomId);

    // Check if chat room already exists
    const chatRoom = await makeChatRoom(roomId, dancerId, clientId);

    res.status(200).json({
      message: "Chat room ready",
      chatRoom: {
        _id: chatRoom._id,
        roomId: chatRoom.roomId,
        dancer: chatRoom.dancer,
        client: chatRoom.client,
        lastMessage: chatRoom.lastMessage,
        lastMessageTime: chatRoom.lastMessageTime,
      },
    });
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
