import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controllers";
const authRouter: Router = Router();

authRouter.post("/login", login);
authRouter.post("/signup", signup);
authRouter.post("/logout", logout);

export default authRouter;
