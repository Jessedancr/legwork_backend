"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const index_router_1 = __importDefault(require("./core/configs/index.router"));
const connectMongo_1 = __importDefault(require("./core/configs/connectMongo"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// * Connect to mongoDB
(0, connectMongo_1.default)();
// * App router
app.use(index_router_1.default);
app.get("/", (req, res) => {
    res.send("H O M E P A G E");
});
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
