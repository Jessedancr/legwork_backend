"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const utils_1 = require("../../../core/configs/utils");
const sendNotification = async (req, res) => {
    const { title, body, deviceToken, channelId } = req.body;
    try {
        if (!deviceToken) {
            return res.status(400).json({ message: "User has no FCM token" });
        }
        await (0, utils_1.sendNotificationToDevice)(deviceToken, title, body, channelId);
        return res.status(200).json({ message: "Notification sent!" });
    }
    catch (error) {
        console.log("Unknown server error sending notification to user: ", error);
        return res.status(500).json({ message: "Unknown server error" });
    }
};
exports.sendNotification = sendNotification;
