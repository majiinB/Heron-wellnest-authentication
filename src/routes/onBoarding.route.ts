import express from "express";
import multer, { MulterError } from "multer";
import type { NextFunction, Request, Response } from "express";
import { StudentRepository } from "../repository/student.repository.js";
import { OnBoardingService } from "../services/onBoarding.service.js";
import { OnBordingController } from "../controllers/onBoarding.controller.js";
import { heronAuthMiddleware } from "../middlewares/heronAuth.middleware..js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import { CollegeProgramRepository } from "../repository/collegeProgram.repository.js";
import { AppError } from "../types/appError.type.js";

const router = express.Router();
const onboardingImageUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
});

function parseOnboardingImageUpload(req: Request, res: Response, next: NextFunction): void {
	onboardingImageUpload.single("file")(req, res, (err: unknown) => {
		if (!err) {
			next();
			return;
		}

		if (err instanceof MulterError) {
			if (err.code === "LIMIT_FILE_SIZE") {
				next(new AppError(413, "IMAGE_FILE_TOO_LARGE", "Image file must not exceed 5MB.", true));
				return;
			}

			if (err.code === "LIMIT_UNEXPECTED_FILE") {
				next(new AppError(400, "UNEXPECTED_IMAGE_FIELD", "Use multipart/form-data field name 'file'.", true));
				return;
			}

			if (err.code === "MISSING_FIELD_NAME") {
				next(new AppError(400, "INVALID_MULTIPART_FORM_DATA", "Malformed multipart form-data: field name is missing.", true));
				return;
			}

			next(new AppError(400, "INVALID_MULTIPART_FORM_DATA", err.message, true));
			return;
		}

		next(err as Error);
	});
}

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

/**
 * @openapi
 * /student/board/image:
 *   post:
 *     summary: Upload student onboarding image
 *     description: |
 *       Uploads an onboarding image for a student account.
 *       - Requires a valid JWT access token with student claims.
 *       - Requires an image file to be present in the request.
 *       - The uploaded file is validated before it is processed.
 *       - Returns image metadata and whether the upload is a duplicate.
 *     tags:
 *       - Student Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Image file payload for student onboarding.
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpeg, png, gif, webp)
 *     responses:
 *       "200":
 *         description: Onboarding image uploaded successfully
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
 *                   example: ONBOARDING_IMAGE_UPLOADED
 *                 message:
 *                   type: string
 *                   example: Onboarding image uploaded for user <USER_NAME>.
 *                 data:
 *                   type: object
 *                   properties:
 *                     content_type:
 *                       type: string
 *                       example: image/jpeg
 *                     size_bytes:
 *                       type: number
 *                       example: 237213
 *                     duplicate:
 *                       type: boolean
 *                       example: false
 *             examples:
 *               uploaded:
 *                 value:
 *                   success: true
 *                   code: ONBOARDING_IMAGE_UPLOADED
 *                   message: Onboarding image uploaded for user <USER_NAME>.
 *                   data:
 *                     content_type: image/jpeg
 *                     size_bytes: 237213
 *                     duplicate: false
 *               alreadyUploaded:
 *                 value:
 *                   success: true
 *                   code: ONBOARDING_IMAGE_ALREADY_UPLOADED
 *                   message: This onboarding image was already uploaded for user <USER_NAME>.
 *                   data:
 *                     content_type: image/jpeg
 *                     size_bytes: 237213
 *                     duplicate: true
 *       "400":
 *         description: Bad request - missing token claims, invalid image, or image file missing
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
 *               missingImageFile:
 *                 value:
 *                   success: false
 *                   code: IMAGE_FILE_MISSING
 *                   message: Please provide an image file in the request.
 *               invalidMimeType:
 *                 value:
 *                   success: false
 *                   code: INVALID_IMAGE_MIMETYPE
 *                   message: Uploaded file must be an image.
 *               invalidImageFile:
 *                 value:
 *                   success: false
 *                   code: INVALID_IMAGE_FILE
 *                   message: Uploaded file is not a supported image format.
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
 *       "413":
 *         description: Image file too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               imageTooLarge:
 *                 value:
 *                   success: false
 *                   code: IMAGE_FILE_TOO_LARGE
 *                   message: Image file must not exceed 5MB.
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
router.post(
	"/student/board/image",
	heronAuthMiddleware,
	parseOnboardingImageUpload,
	asyncHandler(onBoardingController.handleStudentOnboardingImageUpload.bind(onBoardingController)),
);

export default router;
