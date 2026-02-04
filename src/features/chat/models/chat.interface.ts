import { Document, ObjectId } from "mongoose";
import MessageStatus from "../../../core/enums/messageStatusEnum";

export interface ChatRoomInterface extends Document {
  roomId: string;
  dancer: ObjectId;
  client: ObjectId;
  lastMessage?: string;
  lastMessageTime?: Date;
  hasUnreadMessages: boolean;
}

export interface SenderInterface {
  // ? Probably change type to ObjectId
  id: ObjectId | string;
  userType: "dancer" | "client";
}

export interface MessageInterface extends Document {
  roomId: string;
  sender: SenderInterface;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}
