/**
 * Heron Wellnest Authentication API
 *
 * @file index.ts
 * @description This is the main entry point for the Heron Wellnest Authentication API. It sets up the
 * Express application.
 *
 * Routes:
 * - 
 *
 * Middleware:
 * - express.json(): Parses incoming request bodies in JSON format.
 * - CORS policy: (Cross origin resource sharing) checks if the request came
 *   from a valid source.
 *
 * Server:
 * - Listens on port 8080. (Firebase Emulator)
 *
 * To start the server, run `firebase emulators:start`. 
 * - Docker - docker run -p 8080:8080 gcr.io/heron-wellnest/hw-authentication-app:1.0
 * - Local - npm run dev / npm run start
 * The server will listen on the specified port.
 *
 * @author Arthur M. Artugue
 * @created 2025-08-14
 * @updated 2025-08-14
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json());

// This is a health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
