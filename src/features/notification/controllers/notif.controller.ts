import { Request, Response } from "express";
import { NotifInterface } from "../models/notif.interface";
import { sendNotificationToDevice } from "../../../core/configs/utils";

export const sendNotification = async (
  req: Request<{}, {}, NotifInterface>,
  res: Response
) => {
  const { title, body, deviceToken } = req.body;
  try {
    if (!deviceToken) {
      return res.status(400).json({ message: "User has no FCM token" });
    }
    await sendNotificationToDevice(deviceToken, title, body);
    return res.status(200).json({ message: "Notification sent!" });
  } catch (error) {
    console.log("Unknown server error sending notification to user: ", error);
    return res.status(500).json({ message: "Unknown server error" });
  }
};
