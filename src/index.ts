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

export default function createApp(db: any) {
  const app: Application = express();

  // Enable CORS
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  // * Connect to mongoDB
  // connectMongo();

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
    res.json({ message: "H O M E P A G E" });
  });

  app.post("/test", (req: Request, res: Response) => {
    res.status(200).json({ message: "Everything OK" });
  });

  return app;
}

