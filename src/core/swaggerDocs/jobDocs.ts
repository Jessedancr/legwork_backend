// * JOB POSTINGS DOCUMENTATION

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         jobTitle:
 *           type: string
 *         jobLocation:
 *           type: string
 *         prefDanceStyles:
 *           type: array
 *           items:
 *             type: string
 *         pay:
 *           type: string
 *         amtOfDancers:
 *           type: string
 *         jobDuration:
 *           type: string
 *         jobDescr:
 *           type: string
 *         jobType:
 *           type: string
 *         clientId:
 *           type: string
 *         status:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateJobRequest:
 *       type: object
 *       required:
 *         - jobTitle
 *         - jobLocation
 *         - prefDanceStyles
 *         - pay
 *         - amtOfDancers
 *         - jobDuration
 *         - jobDescr
 *         - jobType
 *       properties:
 *         jobTitle:
 *           type: string
 *         jobLocation:
 *           type: string
 *         prefDanceStyles:
 *           type: array
 *           items:
 *             type: string
 *         pay:
 *           type: string
 *         amtOfDancers:
 *           type: string
 *         jobDuration:
 *           type: string
 *         jobDescr:
 *           type: string
 *         jobType:
 *           type: string
 *
 *     ChangeJobStatusRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 */

/**
 * @swagger
 * /api/jobs/create-job:
 *   post:
 *     tags:
 *       - jobs
 *     summary: Create a new job posting (clients only)
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobRequest'
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/jobs/fetch-jobs:
 *   get:
 *     tags:
 *       - jobs
 *     summary: Fetch jobs
 *     description: If a client requests, returns jobs posted by that client; if a dancer requests, returns all jobs.
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       404:
 *         description: No jobs found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/jobs/{jobId}/change-status:
 *   patch:
 *     tags:
 *       - jobs
 *     summary: Change a job's status (clients only)
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeJobStatusRequest'
 *     responses:
 *       200:
 *         description: Job status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request - missing job ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

export {};
