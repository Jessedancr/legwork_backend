"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAuthMiddleware = exports.authMiddleware = exports.passportRefreshStrat = exports.passprtJWTStrat = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_jwt_2 = require("passport-jwt");
const user_schema_1 = require("../../../features/auth/models/user.schema");
const passprtJWTStrat = () => {
    return new passport_jwt_1.Strategy({
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    }, async (payload, done) => {
        try {
            const [dancer, client] = await Promise.all([
                user_schema_1.dancerModel.findById(payload.id),
                user_schema_1.clientModel.findById(payload.id),
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
        }
        catch (error) {
            console.log("JWT Strategy Error: ", error);
            return done(error, false);
        }
    });
};
exports.passprtJWTStrat = passprtJWTStrat;
const passportRefreshStrat = () => {
    return new passport_jwt_2.Strategy({
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromBodyField("refreshToken"),
        secretOrKey: process.env.JWT_REFRESH_SECRET,
    }, async (payload, done) => {
        try {
            const [dancer, client] = await Promise.all([
                user_schema_1.dancerModel.findById(payload.id),
                user_schema_1.clientModel.findById(payload.id),
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
        }
        catch (error) {
            console.log("Refresh Strategy Error: ", error);
            return done(error, false);
        }
    });
};
exports.passportRefreshStrat = passportRefreshStrat;
// * Middleware to authenticate the JWT
exports.authMiddleware = passport_1.default.authenticate("jwt", {
    session: false,
});
// * Middleware to authenticate refresh token
exports.refreshAuthMiddleware = passport_1.default.authenticate("jwt", {
    session: false,
});
