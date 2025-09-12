import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import indexRouter from "./core/configs/index.router";
import connectMongo from "./core/configs/connectMongo";
import {
  passprtJWTStrat,
  passportRefreshStrat,
} from "./core/middlewares/passportStrats/authjwt.middleware";
import cors from "cors";
import morgan from "morgan";

const app: Application = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// Enable CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


// * Connect to mongoDB
connectMongo();

// * Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize()); // Initialize passport
passport.use("jwt", passprtJWTStrat());
passport.use("refresh", passportRefreshStrat());

// * App router
app.use(indexRouter);

app.get("/", (req: Request, res: Response) => {
  console.log("Hello World this is the homepage");
  res.json({ message: "H O M E P A G E" });
});

app.get("/health", (req: Request, res: Response) => {
  console.log("Health check endpoint hit");
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// app.listen(port, () =>
//   console.log(`Server started on http://localhost:${port}`)
// );

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`);
});

