import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { OnBoardingService } from "../services/onBoarding.service.js";
import { AppError } from "../types/appError.type.js";

/**
 * OnBoarding Controller
 * 
 * @description Controller responsible for handling the student onboarding process.
 * It validates JWT claims and request body parameters, then delegates the
 * onboarding logic to the OnBoardingService to complete the student's profile.
 * 
 * @file onBoarding.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-02
 * @updated 2025-09-04
 */
export class OnBordingController {
  private onBoardingService : OnBoardingService;

  constructor(onBoardingService : OnBoardingService){
    this.onBoardingService = onBoardingService;
  }

  public async handleStudentBoarding(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const {sub, email, name} = req.user ?? {}
    const { college_program } = req.body ?? {}

    if (!email || !name || !sub) {
      throw new AppError(
        400,
        "MISSING_TOKEN_CREDENTIALS",
        "JWT is missing student info claims.",
        true
      ) // Stop execution if missing
    }

    if (!college_program){
      throw new AppError(
        400,
        "BODY_PARAM_MISSING",
        "The param college_program is required",
        true
      )
    }

    const response = await this.onBoardingService.completeStudentInfo(sub, college_program);
    res.status(200).json(response);
  }
}