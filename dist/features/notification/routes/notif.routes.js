"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authjwt_middleware_1 = require("../../../core/middlewares/passportStrats/authjwt.middleware");
const notif_controller_1 = require("../controllers/notif.controller");
const notifRouter = (0, express_1.Router)();
notifRouter.post("/send-notif", authjwt_middleware_1.authMiddleware, notif_controller_1.sendNotification);
exports.default = notifRouter;
