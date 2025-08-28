import express from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";

const router = express.Router();

/**
 * POST /login
 * 
 * @description Placeholder route for user login.
 */
router.post("/login", (req: AuthenticatedRequest, res) => {
  res.status(200).json({ message: "Login route" });
});

export default router;