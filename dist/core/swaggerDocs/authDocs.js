"use strict";
// * AUTHENTICATION DOCUMENTATION
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
 *     SignupReqBody:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - username
 *         - email
 *         - phoneNumber
 *         - password
 *         - password2
 *         - userType
 *       properties:
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
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: User's password
 *         password2:
 *           type: string
 *           format: password
 *           description: Password confirmation
 *         userType:
 *           type: string
 *           enum: [dancer, client]
 *           description: Type of user being registered
 *         organisationName:
 *           type: string
 *           description: Organization name (only applicable for clients)
 *         bio:
 *           type: string
 *           description: User's biography
 */
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - auth
 *     summary: Register a new dancer or client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupReqBody'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 dancer:
 *                   $ref: '#/components/schemas/Dancer'
 *                   description: Present only for dancer registration
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *                   description: Present only for client registration
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *       400:
 *         description: Validation error, user already exists, or passwords don't match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
// * LOGIN
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginReqBody:
 *       type: object
 *       required:
 *         - usernameOrEmail
 *         - password
 *       properties:
 *         usernameOrEmail:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login with username or email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginReqBody'
 *     responses:
 *       200:
 *         description: Login successful. Tokens are also set as httpOnly cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Dancer'
 *                     - $ref: '#/components/schemas/Client'
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Password"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     tags:
 *       - auth
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "logout successful, cookies cleared"
 */
// * REFRESH TOKENS
/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshTokensReqBody:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Optional if cookie is present. If provided, must be a valid refresh token.
 */
/**
 * @swagger
 * /api/auth/refresh-tokens:
 *   post:
 *     tags:
 *       - auth
 *     summary: Refresh access and refresh tokens
 *     description: Uses the refresh token from cookies (preferred) or request body to issue new tokens. New tokens are also set as httpOnly cookies.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokensReqBody'
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tokens refreshed successfully"
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: New JWT refresh token
 *       401:
 *         description: Invalid or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Refresh token not provided or invalid"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
