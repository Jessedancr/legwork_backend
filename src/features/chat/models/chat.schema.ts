import mongoose, { Schema } from "mongoose";
import {
  ChatRoomInterface,
  MessageInterface,
  SenderInterface,
} from "./chat.interface";
import MessageStatus from "../../../core/enums/messageStatusEnum";

const chatRoomSchema = new Schema<ChatRoomInterface>(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    dancer: {
      type: Schema.Types.ObjectId,
      ref: "dancer",
      required: true,
      index: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "client",
      required: true,
      index: true,
    },
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date, default: null },
    hasUnreadMessages: { type: Schema.Types.Boolean, default: false },
  },
  { timestamps: true },
);

const senderSchema = new Schema<SenderInterface>(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["dancer", "client"],
      required: true,
    },
  },
  { _id: false },
);

const messageSchema = new Schema<MessageInterface>(
  {
    roomId: {
      type: String,
      required: true,
      ref: "ChatRoom",
      index: true,
    },
    sender: {
      type: senderSchema,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.Sent,
      index: true,
    },
  },
  { timestamps: true },
);

// Compound index for efficient querying
messageSchema.index({ chatRoom: 1, createdAt: -1 });
chatRoomSchema.index({ dancer: 1, client: 1 });

export const messageModel = mongoose.model<MessageInterface>(
  "Message",
  messageSchema,
);

export const chatRoomModel = mongoose.model<ChatRoomInterface>(
  "ChatRoom",
  chatRoomSchema,
);
