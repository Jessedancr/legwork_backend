import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controllers";
import { body, checkSchema } from "express-validator";
import { userSignUpValidationSchema } from "../../../core/middlewares/userSignUpValidationSchema";

const authRouter: Router = Router();

authRouter.post("/login", login);
authRouter.post("/signup", checkSchema(userSignUpValidationSchema), signup);
authRouter.post("/logout", logout);

export default authRouter;
