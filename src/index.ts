import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import indexRouter from "./core/configs/index.router";
import connectMongo from "./core/configs/connectMongo";
import { passprtJWTStrat, passportRefreshStrat } from "./core/middlewares/passportStrats/authjwt.middleware";
import cors from "cors";

const app: Application = express();
const port = process.env.PORT || 3000;
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
app.use(passport.initialize()); // Initialize passport
passport.use("jwt", passprtJWTStrat());
passport.use("refresh", passportRefreshStrat());

// * App router
app.use(indexRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("H O M E P A G E");
});

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
