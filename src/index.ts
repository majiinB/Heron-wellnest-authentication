/**
 * Heron Wellnest Authentication API
 *
 * @file index.ts
 * @description Main entry point for the Heron Wellnest Authentication API. 
 * Imports the configured Express application from `app.js` and starts the 
 * server on the specified port.
 *
 * Server:
 * - Loads the Express app from `app.js`.
 * - Listens on port 8080 (or the port defined in environment variables).
 *
 * Deployment / Execution:
 * - Docker: `docker run -p 8080:8080 gcr.io/heron-wellnest/hw-authentication-app:1.0`
 * - Local: `npm run dev` or `npm run start`
 *
 * The server remains running and listens for incoming HTTP requests.
 *
 * @author Arthur M. Artugue
 * @created 2025-08-14
 * @updated 2025-08-16
 */

import app from './app.js'

// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
