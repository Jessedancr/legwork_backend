import { Router } from "express";
import {
  authMiddleware,
  clientOnly,
} from "../../../core/middlewares/passportStrats/authjwt.middleware";
import {
  changeStatus,
  createJob,
  fetchJobs,
} from "../controllers/job.controllers";
import { postJobValidationSchema } from "../../../core/middlewares/postJobValidationSchema";
import { checkSchema } from "express-validator";
const jobRouter: Router = Router();

jobRouter.post(
  "/create-job",
  authMiddleware,
  clientOnly,
  checkSchema(postJobValidationSchema),
  createJob
);

jobRouter.get("/fetch-jobs", authMiddleware, fetchJobs);

jobRouter.patch(
  "/:jobId/change-status",
  authMiddleware,
  clientOnly,
  changeStatus
);

export default jobRouter;
