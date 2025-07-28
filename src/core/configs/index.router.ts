import { Router } from "express";
import userRouter from "../../features/auth/routes/user.routes";
import authRouter from "../../features/auth/routes/auth.routes";

const indexRouter: Router = Router();

indexRouter.use("/api/auth", authRouter);
indexRouter.use("/api/users", userRouter);

export default indexRouter;
