import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as refreshStrategy } from "passport-jwt";

import {
  clientModel,
  dancerModel,
} from "../../../features/auth/models/user.schema";
import { NextFunction, Request, Response } from "express";
import UserType from "../../enums/userTypeEnum";

declare global {
  namespace Express {
    interface User {
      id: string;
      userType: UserType.Client | UserType.Dancer;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
    }
  }
}

export const passportJWTStrat = () => {
  return new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload, done) => {
      try {
        const [dancer, client] = await Promise.all([
          dancerModel.findById(payload.id),
          clientModel.findById(payload.id),
        ]);
        if (dancer) {
          return done(null, dancer);
        }
        if (client) {
          return done(null, client);
        }

        // user not found
        console.log("JWT Strategy: User not found in any collection");
        return done(null, false);
      } catch (error) {
        console.log("JWT Strategy Error: ", error);
        return done(error, false);
      }
    }
  );
};

export const passportRefreshStrat = () => {
  return new refreshStrategy(
    {
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
    },
    async (payload, done) => {
      try {
        const [dancer, client] = await Promise.all([
          dancerModel.findById(payload.id),
          clientModel.findById(payload.id),
        ]);

        if (dancer) {
          console.log("Refresh Strategy: User found in dancers collection");
          return done(null, dancer);
        }
        if (client) {
          console.log("Refresh Strategy: User found in clients collection");
          return done(null, client);
        }

        // user not found
        console.log("Refresh Strategy: User not found in any collection");
        return done(null, false);
      } catch (error) {
        console.log("Refresh Strategy Error: ", error);
        return done(error, false);
      }
    }
  );
};

// * Middleware to authenticate the JWT
export const authMiddleware = passport.authenticate("jwt", {
  session: false,
});

// * Middleware to authenticate refresh token
export const refreshAuthMiddleware = passport.authenticate("refresh", {
  session: false,
});

export const clientOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorised access" });
  }

  if (req.user.userType !== UserType.Client) {
    return res
      .status(403)
      .json({ message: "Forbidden, only clients can access this" });
  }

  next();
};

export const dancerOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorised access" });
  }

  if (req.user.userType !== UserType.Dancer) {
    return res
      .status(403)
      .json({ message: "Access denied, only dancers can access this" });
  }

  next();
};
