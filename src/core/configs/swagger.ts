import { Router } from "express";
import SwaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
const swaggerRouter: Router = Router();
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Legwork API Documentation",
      version: "1.0.0",
      description:
        "API documentation for Legwork, a platform for dancers and clients to connect",
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

const swaggerSpec = swaggerJSDoc(options);
swaggerRouter.use("/", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));
export default swaggerRouter