import express from "express";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { StudentRepository } from "../repository/student.repository.js";
import { LoginService } from "../services/login.service.js";
import { LoginController } from "../controllers/login.controller.js";
import { googleAuthMiddleware } from "../middlewares/googleAuth.middleware.js";
import { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";

const router = express.Router();
const studentRepository = new  StudentRepository();
const studentRefreshTokenRepository = new StudentRefreshTokenRepository();
const loginService = new LoginService(studentRepository, studentRefreshTokenRepository);
const loginController = new LoginController(loginService);

/**
 * POST /login
 * 
 * @description Handles student login via Google OAuth2. Uses the googleAuthMiddleware to authenticate
 * the user and then processes the login through the LoginController.
 * 
 * @middleware googleAuthMiddleware - Middleware to authenticate user with Google OAuth2.
 * @controller LoginController.handleStudentLogin - Controller method to handle the login logic.
 * @service LoginService.studentLogin - Service method to perform the login operation.
 * @repository StudentRepository - Repository to interact with the student data store.
 * 
 * @access Public
 * @method POST
 * @route /api/v1/auth/login
 * 
 * @returns {Promise<void>} 204 No Content on successful login, or appropriate error response.
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-02
 * @updated 2025-09-04
 */
 router.post("/student/login", googleAuthMiddleware, asyncHandler(loginController.handleStudentLogin.bind(loginController)));

export default router;