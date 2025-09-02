import express from "express";
import { StudentRepository } from "../repository/student.repository.js";
import { OnBoardingService } from "../services/onBoarding.service.js";
import { OnBordingController } from "../controllers/onBoarding.controller.js";
import { heronAuthMiddleware } from "../middlewares/heronAuth.middleware..js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const router = express.Router();
const studentRepository : StudentRepository  = new StudentRepository();
const onBoardingService = new OnBoardingService(studentRepository);
const onBoardingController = new OnBordingController(onBoardingService);

/**
 * POST /login
 * 
 * @description Handles student on boarding. Uses the heronAuthMiddleware to authenticate
 * the user and then processes the on boarding process through the onBoardingController.
 * 
 * @middleware heronAuthMiddleware - Middleware to authenticate user with apis' custom jwt.
 * @controller onBoardingController.handleStudentLogin - Controller method to handle the on boarding logic.
 * @service OnBoardingService.completeStudentInfo - Service method to perform the on boarding operation.
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
 * @updated 2025-09-02
 */
router.post("/student/board", heronAuthMiddleware, asyncHandler(onBoardingController.handleStudentBoarding.bind(onBoardingController)));

export default router;
