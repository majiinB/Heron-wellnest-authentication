import express from "express";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { StudentRepository } from "../repository/student.repository.js";
import { LoginService } from "../services/login.service.js";
import { LoginController } from "../controllers/login.controller.js";
import { googleAuthMiddleware } from "../middlewares/googleAuth.middleware.js";

const router = express.Router();
const studentRepository = new  StudentRepository();
const loginService = new LoginService(studentRepository);
const loginController = new LoginController(loginService);



/**
 * POST /login
 * 
 * @description Placeholder route for user login.
 */
 router.post("/login", googleAuthMiddleware, asyncHandler(loginController.handleStudentLogin.bind(loginController)));

export default router;