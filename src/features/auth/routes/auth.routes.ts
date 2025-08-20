import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controllers";
import { checkSchema } from "express-validator";
import { userSignUpValidationSchema } from "../../../core/middlewares/userSignUpValidationSchema";
import { userLoginValidationSchema } from "../../../core/middlewares/userLoginValidationSchema";

const authRouter: Router = Router();

authRouter.post("/login", checkSchema(userLoginValidationSchema), login);
authRouter.post("/signup", checkSchema(userSignUpValidationSchema), signup);
authRouter.post("/logout", logout);

export default authRouter;
