import express, { Application, Request, Response } from "express";
import userRouter from "./features/auth/routes/user_routes";
import dotenv from "dotenv";

dotenv.config();
const app: Application = express();
const port = process.env.PORT || 3000;

app.use("/api/users", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("H O M E P A G E");
});

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
