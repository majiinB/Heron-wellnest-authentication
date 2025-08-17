/**
 * Heron Wellnest Authentication API
 *
 * @file app.ts
 * @description Sets up and configures the Express application instance for the 
 * Heron Wellnest Authentication API. This file defines middleware, routes, 
 * and application-level settings. It does not start the server directly—`index.ts`
 * handles bootstrapping and listening on the port.
 *
 * Routes:
 * - GET /health: A simple health check endpoint that returns a status of 'ok'.
 *
 * Middleware:
 * - express.json(): Parses incoming request bodies in JSON format.
 * - CORS policy: Applies Cross-Origin Resource Sharing rules for valid sources.
 *
 * Usage:
 * - Imported by `index.ts` to start the server.
 *
 * @author Arthur M. Artugue
 * @created 2025-08-16
 * @updated 2025-08-17
 */

import express from 'express';
import cors from 'cors';
import {corsOptions} from './config/cors.config.js'; 
import { rateLimitConfig } from './config/rateLimit.config.js';
import { rateLimit } from 'express-rate-limit';

const app = express();

app.use(cors(corsOptions)); // Apply CORS middleware with specified options
app.use(rateLimit(rateLimitConfig)); // Apply rate limiting middleware with specified configuration
app.use(express.json()); // Parse incoming JSON request bodies

// This is a health check route
app.get('api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;