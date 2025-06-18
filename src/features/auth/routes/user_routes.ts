import { Router } from "express";
import { getUserById, getUsers } from "../controllers/user_controllers";
const userRouter = Router();

// /api/users/getUsers
userRouter.get("/getUsers", getUsers);

// api/123
userRouter.get('/:userId', getUserById)

export default userRouter;
