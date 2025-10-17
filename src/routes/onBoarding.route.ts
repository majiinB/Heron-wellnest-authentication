import express from "express";
import { StudentRepository } from "../repository/student.repository.js";
import { OnBoardingService } from "../services/onBoarding.service.js";
import { OnBordingController } from "../controllers/onBoarding.controller.js";
import { heronAuthMiddleware } from "../middlewares/heronAuth.middleware..js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import { CollegeProgramRepository } from "../repository/collegeProgram.repository.js";

const router = express.Router();
const studentRepository : StudentRepository = new StudentRepository();
const collegeProgramRepository = new CollegeProgramRepository();
const studentRefreshTokenRepository : StudentRefreshTokenRepository = new StudentRefreshTokenRepository();
const onBoardingService = new OnBoardingService(studentRepository, studentRefreshTokenRepository, collegeProgramRepository);
const onBoardingController = new OnBordingController(onBoardingService);

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
 * /student/board:
 *   post:
 *     summary: Complete student onboarding
 *     description: |
 *       Completes the onboarding process for a student.  
 *       - Requires a valid JWT access token with student claims.  
 *       - The student must provide their `college_department`.  
 *       - On successful onboarding, any existing refresh token is replaced,  
 *         and a new access token + refresh token pair is issued with updated claims.  
 *       - If already onboarded, the request will fail.
 *     tags:
 *       - Student Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: The college program information required to complete onboarding.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - college_program
 *             properties:
 *               college_program:
 *                 type: string
 *                 example: Bachelor of Science in Computer Science (Application Development Elective Track)
 *     responses:
 *       "200":
 *         description: Onboarding successful
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
 *                   example: USER_SUCESSFULLY_ONBOARDED
 *                 message:
 *                   type: string
 *                   example: User Juan Dela Cruz successfully onboarded
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: JWT access token with updated claims
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                     refresh_token:
 *                       type: string
 *                       description: Refresh token for session management
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                     is_onboarded:
 *                       type: boolean
 *                       example: true
 *             examples:
 *               onboardSuccess:
 *                 value:
 *                   success: true
 *                   code: USER_SUCESSFULLY_ONBOARDED
 *                   message: User Juan Dela Cruz successfully onboarded
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     is_onboarded: true
 *       "400":
 *         description: Bad request - missing token claims or body params
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingTokenClaims:
 *                 value:
 *                   success: false
 *                   code: MISSING_TOKEN_CREDENTIALS
 *                   message: JWT is missing student info claims.
 *               missingDepartment:
 *                 value:
 *                   success: false
 *                   code: BODY_PARAM_MISSING
 *                   message: The param college_department is required
 *               invalidRefreshToken:
 *                 value:
 *                   success: false
 *                   code: INVALID_REFRESH_TOKEN
 *                   message: Refresh token payload missing user ID.
 *       "401":
 *         description: Unauthorized - refresh token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               refreshNotFound:
 *                 value:
 *                   success: false
 *                   code: REFRESH_TOKEN_NOT_FOUND
 *                   message: Refresh token not found or already invalidated.
 *       "404":
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   code: USER_TO_BE_ONBOARDED_NOT_FOUND
 *                   message: "User with ID: <uuid> was not found"
 *       "409":
 *         description: Conflict - user already onboarded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyOnboarded:
 *                 value:
 *                   success: false
 *                   code: USER_ALREADY_ONBOARDED
 *                   message: User Juan Dela Cruz is already onboarded.
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
router.post("/student/board", heronAuthMiddleware, asyncHandler(onBoardingController.handleStudentBoarding.bind(onBoardingController)));

export default router;
