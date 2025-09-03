import express from 'express';
import { StudentRefreshTokenRepository } from '../repository/studentRefreshToken.repository.js';
import { RefreshTokenService } from '../services/refresh.service.js';
import { RefreshTokenController } from '../controllers/refresh.controller.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

const router = express.Router();
const refreshTokenRepo = new StudentRefreshTokenRepository();
const refreshTokenService = new RefreshTokenService(refreshTokenRepo);
const refreshTokenController = new RefreshTokenController(refreshTokenService);


router.post('/student/refresh', asyncHandler(refreshTokenController.handleStudentRefresh.bind(refreshTokenController)));

export default router;