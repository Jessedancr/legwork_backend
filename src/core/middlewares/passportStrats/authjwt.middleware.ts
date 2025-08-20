import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import {
  clientModel,
  dancerModel,
} from "../../../features/auth/models/user.schema";

export const passprtJWTStrat = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
  };
  return new Strategy(options, async (payload, done) => {
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
  });
};

// * Middleware to authenticate the JWT
export const authMiddleware = passport.authenticate("jwt", {
  session: false,
});
