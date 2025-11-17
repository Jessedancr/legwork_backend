import { Router } from "express";
import { authMiddleware } from "../../../core/middlewares/passportStrats/authjwt.middleware";
import { sendNotification } from "../controllers/notif.controller";
const notifRouter: Router = Router();

notifRouter.post("/send-notif", authMiddleware, sendNotification);

export default notifRouter;
