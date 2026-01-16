import { Router } from "express";
import { checkSchema } from "express-validator";
import { authMiddleware } from "../../../core/middlewares/passportStrats/authjwt.middleware";
import {
  createChatRoom,
} from "../controllers/message.controllers";
import { createChatRoomValidation } from "../../../core/middlewares/messageValidation.schema";

const messageRouter: Router = Router();

messageRouter.post(
  "/create-chat-room",
  authMiddleware,
  checkSchema(createChatRoomValidation),
  createChatRoom
);

export default messageRouter;
