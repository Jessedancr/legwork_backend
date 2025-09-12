"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const swagger_1 = __importDefault(require("../configs/swagger"));
const user_routes_1 = __importDefault(require("../../features/auth/routes/user.routes"));
const auth_routes_1 = __importDefault(require("../../features/auth/routes/auth.routes"));
const indexRouter = (0, express_1.Router)();
indexRouter.use("/api/auth", auth_routes_1.default);
indexRouter.use("/api/users", user_routes_1.default);
indexRouter.use("/api-docs", swagger_1.default);
exports.default = indexRouter;
