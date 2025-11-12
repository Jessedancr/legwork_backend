import { Router } from "express";
import swagger from "../configs/swagger";
import userRouter from "../../features/auth/routes/user.routes";
import authRouter from "../../features/auth/routes/auth.routes";
import jobRouter from "../../features/jobPosting/routes/job.routes";
import { jobApplicationRouter } from "../../features/jobApplication/routes/jobApplication.routes";
import notifRouter from "../../features/notification/routes/notif.routes";

const indexRouter: Router = Router();

indexRouter.use("/api/auth", authRouter);
indexRouter.use("/api/users", userRouter);
indexRouter.use("/api/jobs", jobRouter);
indexRouter.use("/api/job-applications", jobApplicationRouter);
indexRouter.use("/api/notif", notifRouter);
indexRouter.use("/api-docs", swagger);

export default indexRouter;
