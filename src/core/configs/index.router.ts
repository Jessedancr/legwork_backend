import { Router } from "express";
import userRouter from "../../features/auth/routes/user.routes";
import authRouter from "../../features/auth/routes/auth.routes";

const indexRouter: Router = Router();

indexRouter.use("/auth", authRouter);
indexRouter.use("/users", userRouter);

export default indexRouter;
