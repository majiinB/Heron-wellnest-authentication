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
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         code:
 *           type: string
 *           example: BAD_REQUEST
 *         message:
 *           type: string
 *           example: Invalid input data
 */
 
/**
 * @openapi
 * /student/login:
 *   post:
 *     summary: Student login with Google authentication
 *     description: |
 *       Handles student login using Google authentication.  
 *       - If the student does not exist, a new account is automatically created.  
 *       - Any existing refresh token for the student will be invalidated and replaced.  
 *       - Returns a new JWT access token and refresh token pair for secure session management.
 *     tags:
 *       - Student Authentication
 *     security: 
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       description: Google-authenticated user information injected by middleware
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.edu
 *               name:
 *                 type: string
 *                 example: Juan Dela Cruz
 *     responses:
 *       "200":
 *         description: Login successful or onboarding required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: LOGIN_SUCCESS
 *                 message:
 *                   type: string
 *                   example: Student login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: JWT access token for authenticated requests
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                     refresh_token:
 *                       type: string
 *                       description: Refresh token for session management
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                     is_onboarded:
 *                       type: boolean
 *                       example: true
 *             examples:
 *               loginSuccess:
 *                 value:
 *                   success: true
 *                   code: LOGIN_SUCCESS
 *                   message: Student login successful
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     is_onboarded: true
 *               onboardingRequired:
 *                 value:
 *                   success: true
 *                   code: ONBOARDING_REQUIRED
 *                   message: Onboarding required to complete your profile
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     is_onboarded: false
 *       "400":
 *         description: Missing Google credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingGoogleCredentials:
 *                 value:
 *                   success: false
 *                   code: MISSING_GOOGLE_CREDENTIALS
 *                   message: Missing Google user info.
 *       "401":
 *         description: Unauthorized - token or time errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               tokenTimeError:
 *                 value:
 *                   success: false
 *                   code: AUTH_TOKEN_TIME_ERROR
 *                   message: Google token rejected due to time mismatch. Please check your device or server clock. / No token provided.
 *               noTokenError:
 *                 value:
 *                   success: false
 *                   code: AUTH_NO_TOKEN
 *                   message: No token provided.
 *       "403":
 *         description: Forbidden - unauthorized email domain
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedDomain:
 *                 value:
 *                   success: false
 *                   code: AUTH_UNAUTHORIZED_DOMAIN
 *                   message: "Unauthorized domain: undefined, Umak email required"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   code: INTERNAL_SERVER_ERROR
 *                   message: Internal server error
 */
 router.post("/student/login", googleAuthMiddleware, asyncHandler(loginController.handleStudentLogin.bind(loginController)));

export default router;