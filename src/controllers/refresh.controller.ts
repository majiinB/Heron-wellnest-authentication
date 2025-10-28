import type { Request, Response, NextFunction } from "express";
import type { RefreshTokenService } from "../services/refresh.service.js";
import { AppError } from "../types/appError.type.js";
// @typescript-eslint/no-unused-vars
import { validate as isUuid } from "uuid";

/**
 * RefreshToken Controller
 * 
 * @description Handles HTTP requests for token refreshing.
 * 
 * @file refresh-token.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-04
 * @updated 2025-09-04
 */
export class RefreshTokenController {
  private refreshTokenService: RefreshTokenService;

  constructor(refreshTokenService: RefreshTokenService) {
    this.refreshTokenService = refreshTokenService;
  }

  public async handleStudentRefresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { user_id, refresh_token } = req.body ?? {};

    if(!isUuid(user_id)){
      throw new AppError(400, "INVALID_USER_ID", "user_id must be a valid UUID.", true);
    }

    if (!user_id || !refresh_token) {
      throw new AppError(400, "MISSING_REFRESH_PAYLOAD", "user_id and refresh_token are required.", true);
    }

    const response = await this.refreshTokenService.rotateStudentToken(user_id, refresh_token);
    res.status(200).json(response);
  }

  public async handleAdminRefresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { user_id, refresh_token } = req.body ?? {};

    if(!isUuid(user_id)){
      throw new AppError(400, "INVALID_USER_ID", "user_id must be a valid UUID.", true);
    }

    if (!user_id || !refresh_token) {
      throw new AppError(400, "MISSING_REFRESH_PAYLOAD", "user_id and refresh_token are required.", true);
    }

    const response = await this.refreshTokenService.rotateAdminToken(user_id, refresh_token);
    res.status(200).json(response);
  }

  public async handleCounselorRefresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { user_id, refresh_token } = req.body ?? {};

    if(!isUuid(user_id)){
      throw new AppError(400, "INVALID_USER_ID", "user_id must be a valid UUID.", true);
    }

    if (!user_id || !refresh_token) {
      throw new AppError(400, "MISSING_REFRESH_PAYLOAD", "user_id and refresh_token are required.", true);
    }

    const response = await this.refreshTokenService.rotateCounselorToken(user_id, refresh_token);
    res.status(200).json(response);
  }
}