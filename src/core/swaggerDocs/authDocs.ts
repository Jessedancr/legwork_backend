// * SIGNUP
/**
 * @swagger
 * components:
 *   schemas:
 *     SignupReqBody:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - phoneNumber
 *         - password
 *         - password2
 *         - userType
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *         password2:
 *           type: string
 *           format: password
 *         userType:
 *           type: string
 *           enum: [dancer, client]
 *         organisationName:
 *           type: string
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
 *         description: Dancer or client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 dancer:
 *                   type: string
 *                 client:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error or user already exists
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
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
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
 *                 Message:
 *                   type: string
 */
