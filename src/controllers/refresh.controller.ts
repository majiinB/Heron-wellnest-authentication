import type { Request, Response, NextFunction } from "express";
import type { RefreshTokenService } from "../services/refresh.service.js";
import { AppError } from "../types/appError.type.js";

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

    if (!user_id || !refresh_token) {
      throw new AppError(400, "MISSING_REFRESH_PAYLOAD", "user_id and refresh_token are required.", true);
    }

    const response = await this.refreshTokenService.rotateStudentToken(user_id, refresh_token);
    res.status(200).json(response);
  }
}