// * JOB APPLICATIONS DOCUMENTATION

/**
 * @swagger
 * components:
 *   schemas:
 *     JobApplication:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         jobId:
 *           type: string
 *         dancerId:
 *           type: string
 *         clientId:
 *           type: string
 *         applicationStatus:
 *           type: string
 *         proposal:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ApplyJobRequest:
 *       type: object
 *       required:
 *         - proposal
 *       properties:
 *         proposal:
 *           type: string
 *           description: Application proposal; should be between 50 and 1000 characters
 *
 *     UpdateApplicationStatusRequest:
 *       type: object
 *       properties:
 *         applicationStatus:
 *           type: string
 *           description: e.g., "accepted", "rejected", "pending"
 */

/**
 * @swagger
 * /api/job-applications/{jobId}/apply-for-job:
 *   post:
 *     tags:
 *       - job-applications
 *     summary: Apply for a job (dancers only)
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyJobRequest'
 *     responses:
 *       201:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   $ref: '#/components/schemas/JobApplication'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate application
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/job-applications/{jobId}/applications:
 *   get:
 *     tags:
 *       - job-applications
 *     summary: Get applications for a job (clients only)
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applications retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: No applications found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/job-applications/get-dancer-applications:
 *   get:
 *     tags:
 *       - job-applications
 *     summary: Get applications for the authenticated dancer (dancers only)
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Dancer's applications retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appsWithJobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: No applications found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/job-applications/{appId}/accept-app:
 *   patch:
 *     tags:
 *       - job-applications
 *     summary: Accept an application (clients only)
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicationStatusRequest'
 *     responses:
 *       200:
 *         description: Application accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 app:
 *                   $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/job-applications/{appId}/reject-app:
 *   patch:
 *     tags:
 *       - job-applications
 *     summary: Reject an application (clients only)
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicationStatusRequest'
 *     responses:
 *       200:
 *         description: Application rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 app:
 *                   $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */

export {};
