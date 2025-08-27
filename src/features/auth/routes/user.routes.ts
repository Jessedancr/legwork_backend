import { Router } from "express";
import {
  getDeviceToken,
  getUserDetails,
  getUsers,
  updateUserDetails,
} from "../controllers/user.controllers";
import { authMiddleware } from "../../../core/middlewares/passportStrats/authjwt.middleware";
import { userIdValidationSchema } from "../../../core/middlewares/userIdValidator";
import { checkSchema } from "express-validator";
const userRouter: Router = Router();

userRouter.get("/get-users", getUsers);

userRouter.get("/:userId/get-user-details", authMiddleware, getUserDetails);

userRouter.get("/:userId/get-device-token", getDeviceToken);

userRouter.patch(
  "/:userId/update-user-details",
  authMiddleware,
  checkSchema(userIdValidationSchema),
  updateUserDetails
);

export default userRouter;
