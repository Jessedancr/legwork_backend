"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const index_router_1 = __importDefault(require("./core/configs/index.router"));
const connectMongo_1 = __importDefault(require("./core/configs/connectMongo"));
const authjwt_middleware_1 = require("./core/middlewares/passportStrats/authjwt.middleware");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// Enable CORS
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
// * Connect to mongoDB
(0, connectMongo_1.default)();
// * Middlewares
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(passport_1.default.initialize()); // Initialize passport
passport_1.default.use("jwt", (0, authjwt_middleware_1.passprtJWTStrat)());
passport_1.default.use("refresh", (0, authjwt_middleware_1.passportRefreshStrat)());
// * App router
app.use(index_router_1.default);
app.get("/", (req, res) => {
    console.log("Hello World this is the homepage");
    res.json({ message: "H O M E P A G E" });
});
app.get("/health", (req, res) => {
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
