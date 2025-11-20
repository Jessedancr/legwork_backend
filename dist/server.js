"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connectMongo_1 = __importDefault(require("./core/configs/connectMongo"));
const app_1 = __importDefault(require("./app"));
const app = (0, app_1.default)((0, connectMongo_1.default)());
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on http://localhost:${port}`);
});
exports.default = app;
