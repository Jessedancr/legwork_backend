"use strict";
// * USER MANAGEMENT DOCUMENTATION
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         bio:
 *           type: string
 *           description: User's biography
 *         userType:
 *           type: string
 *           enum: [dancer, client]
 *           description: Type of user
 *         profilePicture:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: URL of the profile picture
 *             publicId:
 *               type: string
 *               description: Cloudinary public ID
 *         deviceToken:
 *           type: string
 *           description: Device token for push notifications
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
 *
 *     Dancer:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             jobPrefs:
 *               type: object
 *               description: Job preferences for dancers
 *             resume:
 *               type: object
 *               description: Dancer's resume information
 *
 *     Client:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             danceStylePrefs:
 *               type: array
 *               items:
 *                 type: string
 *               description: Preferred dance styles
 *             jobOfferings:
 *               type: array
 *               description: Job offerings posted by client
 *             organisationName:
 *               type: string
 *               description: Name of the organization
 *             hiringHistory:
 *               type: object
 *               description: History of hired dancers
 *
 *     ProfilePicture:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: URL of the uploaded image
 *         publicId:
 *           type: string
 *           description: Cloudinary public ID
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         bio:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         deviceToken:
 *           type: string
 *         organisationName:
 *           type: string
 *           description: Only applicable for clients
 *         danceStylePrefs:
 *           type: array
 *           items:
 *             type: string
 *           description: Only applicable for clients
 *         jobPrefs:
 *           type: object
 *           description: Only applicable for dancers
 *         resume:
 *           type: object
 *           description: Only applicable for dancers
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               param:
 *                 type: string
 *               location:
 *                 type: string
 */
/**
 * @swagger
 * /api/users/get-users:
 *   get:
 *     tags:
 *       - users
 *     summary: Get all users
 *     description: Retrieve a list of all users in the system
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/users/{userId}/get-user-details:
 *   get:
 *     tags:
 *       - users
 *     summary: Get user details by ID
 *     description: Retrieve detailed information about a specific user
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Dancer'
 *                     - $ref: '#/components/schemas/Client'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/users/{userId}/get-device-token:
 *   get:
 *     tags:
 *       - users
 *     summary: Get user's device token
 *     description: Retrieve the device token for push notifications for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Device token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deviceToken:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/users/{userId}/update-user-details:
 *   patch:
 *     tags:
 *       - users
 *     summary: Update user details
 *     description: Update user information. Only authenticated users can update their own details.
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Dancer'
 *                     - $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/users/{userId}/upload-profile-image:
 *   post:
 *     tags:
 *       - users
 *     summary: Upload profile image
 *     description: Upload a profile image for a user. The image will be uploaded to Cloudinary.
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/ProfilePicture'
 *       400:
 *         description: No file uploaded or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or Cloudinary upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
