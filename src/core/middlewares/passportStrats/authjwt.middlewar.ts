import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { userModel } from "../../../features/auth/models/user.schema";

export const passprtJWTStrat = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
  };
  return new Strategy(options, async (payload, done) => {
    try {
      // * Find the user by ID from payload
      const user = await userModel.findById(payload.id);
      if (user) {
        // User found, return user
        return done(null, user);
      }
      // user not found
      return done(null, false);
    } catch (error) {
      console.log("JWT Strategy Error: ", error);
    }
  });
};

// * Middleware to authenticate the JWT
export const authMiddleware = passport.authenticate("jwt", {
  session: false,
});
