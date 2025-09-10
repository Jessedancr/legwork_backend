import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as refreshStrategy } from "passport-jwt";

import {
  clientModel,
  dancerModel,
} from "../../../features/auth/models/user.schema";

export const passprtJWTStrat = () => {
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
          console.log("JWT Strategy: User found in dancers collection");
          return done(null, dancer);
        }
        if (client) {
          console.log("JWT Strategy: User found in clients collection");
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
export const refreshAuthMiddleware = passport.authenticate("jwt", {
  session: false,
});
