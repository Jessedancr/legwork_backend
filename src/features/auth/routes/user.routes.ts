import { Router } from "express";
import {
  getDeviceToken,
  getUserById,
  getUsers,
} from "../controllers/user.controllers";
const userRouter: Router = Router();

userRouter.get("/getUsers", getUsers);

userRouter.get("/:userId", getUserById);

userRouter.get("/:userId/deviceToken", getDeviceToken);

export default userRouter;
