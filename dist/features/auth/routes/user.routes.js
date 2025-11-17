"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const authjwt_middleware_1 = require("../../../core/middlewares/passportStrats/authjwt.middleware");
const upload_middleware_1 = __importDefault(require("../../../core/middlewares/upload.middleware"));
const userRouter = (0, express_1.Router)();
userRouter.get("/get-users", user_controllers_1.getUsers);
userRouter.get("/:userId/get-user-details", authjwt_middleware_1.authMiddleware, user_controllers_1.getUserDetails);
userRouter.get("/:userId/get-device-token", user_controllers_1.getDeviceToken);
userRouter.patch("/:userId/update-user-details", authjwt_middleware_1.authMiddleware, user_controllers_1.updateUserDetails);
userRouter.post("/:userId/upload-profile-image", authjwt_middleware_1.authMiddleware, upload_middleware_1.default.single("profileImage"), user_controllers_1.uploadProfileImage);
exports.default = userRouter;
