"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const userRouter = (0, express_1.Router)();
userRouter.get("/getUsers", user_controllers_1.getUsers);
userRouter.get("/:userId", user_controllers_1.getUserById);
userRouter.get("/:userId/deviceToken", user_controllers_1.getDeviceToken);
exports.default = userRouter;
