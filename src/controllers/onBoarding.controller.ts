import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import type { OnBoardingService } from "../services/onBoarding.service.js";
import { AppError } from "../types/appError.type.js";

export class OnBordingController {
  private onBoardingService : OnBoardingService;

  constructor(onBoardingService : OnBoardingService){
    this.onBoardingService = onBoardingService;
  }

  public async handleStudentBoarding(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const {sub, email, name} = req.user ?? {}
    const { college_department } = req.body ?? {}

    if (!email || !name || !sub) {
      throw new AppError(
        400,
        "MISSING_TOKEN_CREDENTIALS",
        "JWT is missing student info claims.",
        true
      ) // Stop execution if missing
    }

    if (!college_department){
      throw new AppError(
        400,
        "BODY_PARAM_MISSING",
        "The param college_department is required",
        true
      )
    }

    const response = await this.onBoardingService.completeStudentInfo(sub, college_department);
    res.status(200).json(response);
  }
}