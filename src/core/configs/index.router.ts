import { Router } from "express";
import swagger from "../configs/swagger";
import userRouter from "../../features/auth/routes/user.routes";
import authRouter from "../../features/auth/routes/auth.routes";
import jobRouter from "../../features/jobPosting/routes/job.routes";

const indexRouter: Router = Router();

indexRouter.use("/api/auth", authRouter);
indexRouter.use("/api/users", userRouter);
indexRouter.use("/api/jobs", jobRouter);
indexRouter.use("/api-docs", swagger);

export default indexRouter;
