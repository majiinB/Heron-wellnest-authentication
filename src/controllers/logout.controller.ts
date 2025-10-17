import type {Response, Request, NextFunction } from "express";
import type { LogoutService } from "../services/logout.service.js";

export class LogoutController {
  private logoutService: LogoutService;

  constructor(logoutService: LogoutService) {
    this.logoutService = logoutService;
  }

  public async handleStudentLogout(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        code: "MISSING_REFRESH_TOKEN",
        message: "Refresh token is required to logout.",
      });
      return;
    }

    const response = await this.logoutService.studentlogout(refresh_token);
    res.status(200).json(response);
  }

  public async handleCounselorLogout(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        code: "MISSING_REFRESH_TOKEN",
        message: "Refresh token is required to logout.",
      });
      return;
    }

    const response = await this.logoutService.counselorLogout(refresh_token);
    res.status(200).json(response);
  }

  public async handleAdminLogout(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        code: "MISSING_REFRESH_TOKEN",
        message: "Refresh token is required to logout.",
      });
      return;
    }

    const response = await this.logoutService.adminLogout(refresh_token);
    res.status(200).json(response);
  }
}