import { Router } from "express";
import { checkSchema } from "express-validator";
import { authMiddleware } from "../../../core/middlewares/passportStrats/authjwt.middleware";
import {
  createChatRoom,
  // sendMessage,
  // getChatRooms,
  // getMessages,
  // updateMessageStatus,
  // getUnreadCount,
} from "../controllers/message.controllers";
import {
  createChatRoomValidation,
  //   sendMessageValidation,
  //   getMessagesValidation,
  //   updateMessageStatusValidation,
  //   deleteMessageValidation,
} from "../../../core/middlewares/messageValidation.schema";
const messageRouter: Router = Router();

messageRouter.post(
  "/create-chat-room",
  authMiddleware,
  checkSchema(createChatRoomValidation),
  createChatRoom
);

// messageRouter.get("/chat-rooms", getChatRooms);

// messageRouter.get(
//   "/chat-rooms/:chatRoomId/messages",
//   authMiddleware,
//   //   checkSchema(getMessagesValidation),
//   getMessages
// );
// messageRouter.put(
//   "/messages/:messageId/status",
//   authMiddleware,
//   //   checkSchema(updateMessageStatusValidation),
//   updateMessageStatus
// );

// // Message operations
// messageRouter.post(
//   "/send",
//   authMiddleware,
//   //   checkSchema(sendMessageValidation),
//   sendMessage
// );

// // Utility endpoints
// messageRouter.get("/unread-count", authMiddleware, getUnreadCount);

export default messageRouter;
