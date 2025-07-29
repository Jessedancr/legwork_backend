import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import indexRouter from "./core/configs/index.router";
import connectMongo from "./core/configs/db/connectMongo";

const app: Application = express();
const port = process.env.PORT || 3000;

// * Connect to mongoDB
connectMongo();

// * App router
app.use(indexRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("H O M E P A G E");
});

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
