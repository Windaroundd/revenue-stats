import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Restaurant Revenue Analytics API",
      version: "1.0.0",
      description: "API for managing and analyzing restaurant revenue data",
      contact: {
        name: "API Support",
        email: "support@restaurant.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3214",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Admin: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            email: { type: "string", example: "admin@restaurant.com" },
            name: { type: "string", example: "Admin User" },
            role: { type: "string", enum: ["admin", "super_admin"] },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        RevenueData: {
          type: "object",
          required: ["date", "posRevenue", "eatclubRevenue", "labourCosts", "totalCovers"],
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            date: { type: "string", format: "date", example: "2025-10-03" },
            dayOfWeek: {
              type: "string",
              enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              example: "Thu",
            },
            posRevenue: { type: "number", minimum: 0, example: 1850.5 },
            eatclubRevenue: { type: "number", minimum: 0, example: 450.25 },
            labourCosts: { type: "number", minimum: 0, example: 650 },
            totalCovers: { type: "integer", minimum: 0, example: 105 },
            events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Local Festival" },
                  impact: { type: "string", enum: ["positive", "negative"] },
                },
              },
            },
            weekNumber: { type: "integer", example: 40 },
            year: { type: "integer", example: 2025 },
            totalRevenue: { type: "number", example: 2300.75 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  msg: { type: "string" },
                  param: { type: "string" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "Admin authentication endpoints" },
      { name: "Revenue Management", description: "Revenue data CRUD operations (Admin only)" },
      { name: "Analytics", description: "Public analytics and statistics" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
