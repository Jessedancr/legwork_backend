// * NOTIFICATIONS DOCUMENTATION

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         deviceToken:
 *           type: string
 *         channelId:
 *           type: string
 *
 *     SendNotificationRequest:
 *       type: object
 *       required:
 *         - title
 *         - body
 *         - deviceToken
 *       properties:
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         deviceToken:
 *           type: string
 *         channelId:
 *           type: string
 */

/**
 * @swagger
 * /api/notif/send-notif:
 *   post:
 *     tags:
 *       - notif
 *     summary: Send a push notification to a device
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendNotificationRequest'
 *     responses:
 *       200:
 *         description: Notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - missing device token
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export {};
