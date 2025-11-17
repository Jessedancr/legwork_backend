"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerRouter = (0, express_1.Router)();
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Legwork API Documentation",
            version: "1.0.0",
            description: "API documentation for Legwork, a platform for dancers and clients to connect",
        },
        tags: [
            { name: "auth", description: "Authentication routes" },
            { name: "users", description: "User management routes" },
        ],
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: "Development server",
            },
            {
                url: 'https://legwork-backend.onrender.com/',
                description: "Production server",
            }
        ],
        components: {
            securitySchemes: {
                bearer: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "x-api-key",
                },
            },
        },
    },
    apis: ["./src/core/swaggerDocs/*.ts"], // Path to the API documentation files
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
swaggerRouter.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
exports.default = swaggerRouter;
