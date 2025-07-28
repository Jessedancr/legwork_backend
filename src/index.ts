import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import indexRouter from "./core/configs/index.router";

const app: Application = express();
const port = process.env.PORT || 3000;

// * App router
app.use(indexRouter);


app.get("/", (req: Request, res: Response) => {
  res.send("H O M E P A G E");
});

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
