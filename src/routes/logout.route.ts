import express from 'express'
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { LogoutController } from "../controllers/logout.controller.js"
import { LogoutService } from "../services/logout.service.js";
import { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";

const router = express.Router();
const studentTokenRepo = new StudentRefreshTokenRepository();
const logoutService = new LogoutService(studentTokenRepo)
const logoutController = new LogoutController(logoutService);


router.post('/student/logout',asyncHandler(logoutController.handleStudentLogout.bind(logoutController)));

export default router;