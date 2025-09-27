import express from 'express';
import { StudentRefreshTokenRepository } from '../repository/studentRefreshToken.repository.js';
import { RefreshTokenService } from '../services/refresh.service.js';
import { RefreshTokenController } from '../controllers/refresh.controller.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

const router = express.Router();
const refreshTokenRepo = new StudentRefreshTokenRepository();
const refreshTokenService = new RefreshTokenService(refreshTokenRepo);
const refreshTokenController = new RefreshTokenController(refreshTokenService);

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
 * /student/refresh:
 *   post:
 *     summary: Refresh Student Access Token
 *     description: |
 *       Rotates the student’s refresh token and issues a new access token.  
 *       This keeps the session alive while ensuring token security.
 *     tags:
 *       - Student Authentication
 *     security: []   # No bearerAuth required, only refresh token in body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - refresh_token
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "56c2192f-ed9b-4cf3-9c44-5608f99eab67"
 *               refresh_token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ..."
 *     responses:
 *       200:
 *         description: Token refresh successful (with or without onboarding requirement)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     is_onboarded:
 *                       type: boolean
 *             examples:
 *               refreshSuccess:
 *                 summary: Successfully refreshed
 *                 value:
 *                   success: true
 *                   code: ACCESS_TOKEN_REFRESH_SUCCESS
 *                   message: "Student access token refresh successful"
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     is_onboarded: true
 *               refreshSuccessOnboardingRequired:
 *                 summary: Refreshed but onboarding still required
 *                 value:
 *                   success: true
 *                   code: ACCESS_TOKEN_REFRESH_SUCCESS_ONBOARDING_REQUIRED
 *                   message: "Student access token refresh successful. Onboarding required to complete your profile"
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *                     is_onboarded: false
 *       400:
 *         description: Missing required request payload
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               code: MISSING_REFRESH_PAYLOAD
 *               message: "user_id and refresh_token are required."
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             examples:
 *               invalidToken:
 *                 value:
 *                   success: false
 *                   code: INVALID_REFRESH_TOKEN
 *                   message: "Refresh token is invalid or not found"
 *               expiredToken:
 *                 value:
 *                   success: false
 *                   code: EXPIRED_REFRESH_TOKEN
 *                   message: "Refresh token expired"
 *       404:
 *         description: User linked to refresh token not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               code: USER_NOT_FOUND
 *               message: "User linked to refresh token not found."
 */
router.post('/student/refresh', asyncHandler(refreshTokenController.handleStudentRefresh.bind(refreshTokenController)));

export default router;