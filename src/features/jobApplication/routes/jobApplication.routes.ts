import { Router } from "express";
import {
  authMiddleware,
  dancerOnly,
  clientOnly,
} from "../../../core/middlewares/passportStrats/authjwt.middleware";
import { checkSchema } from "express-validator";
import { jobApplicationValidationSchema } from "../../../core/middlewares/jobApplicationValidation.schema";
import {
  acceptApplication,
  applyForJob,
  getApplicationsForDancer,
  getApplicationsForJob,
  rejectApplication,
} from "../controllers/jobApplication.controllers";

export const jobApplicationRouter: Router = Router();

jobApplicationRouter.post(
  "/:jobId/apply-for-job",
  authMiddleware,
  dancerOnly,
  checkSchema(jobApplicationValidationSchema),
  applyForJob
);

jobApplicationRouter.get(
  "/:jobId/applications",
  authMiddleware,
  clientOnly,
  getApplicationsForJob
);

jobApplicationRouter.get(
  "/get-dancer-applications",
  authMiddleware,
  dancerOnly,
  getApplicationsForDancer
);

jobApplicationRouter.patch(
  "/:appId/accept-app",
  authMiddleware,
  clientOnly,
  acceptApplication
);

jobApplicationRouter.patch(
  "/:appId/reject-app",
  authMiddleware,
  clientOnly,
  rejectApplication
);
