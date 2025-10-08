import { Router } from "express";
import {
  authMiddleware,
  dancerOnly,
  clientOnly,
} from "../../../core/middlewares/passportStrats/authjwt.middleware";
import { checkSchema } from "express-validator";
import { jobApplicationValidationSchema } from "../../../core/middlewares/jobApplicationValidation.schema";
import {
  applyForJob,
  getApplicationsForJob,
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
