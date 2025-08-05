import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controllers";
import { body, checkSchema } from "express-validator";
import { userValidationSchema } from "../../../core/middlewares/userValidationSchema";

const authRouter: Router = Router();

authRouter.post("/login", login);
authRouter.post("/signup", checkSchema(userValidationSchema), signup);
authRouter.post("/logout", logout);

export default authRouter;
