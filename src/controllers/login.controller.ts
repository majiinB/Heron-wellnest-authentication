import type { NextFunction, Response} from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import { Student } from "../models/student.model.js";
import type { LoginService } from "../services/login.service.js";
import { AppError } from "../types/appError.type.js";

/**
 * Login Controller
 * 
 * @description Controller responsible for handling student login requests.
 * It validates Google OAuth user credentials from the request, constructs a
 * Student entity, and delegates the login logic to the LoginService.
 * 
 * @file login.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-02
 * @updated 2025-09-04
 */
export class LoginController {
  private loginService: LoginService;
  
  constructor(loginService: LoginService) {
    this.loginService = loginService;
  }

  public async handleStudentLogin(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const { email, name } = req.user ?? {};

    if (!email || !name) {
      throw new AppError(
        400,
        "MISSING_GOOGLE_CREDENTIALS",
        "Missing Google user info.",
        true
      ) // Stop execution if missing
    }

    const googleUser = new Student();
    googleUser.email = email;
    googleUser.user_name = name;

    const response = await this.loginService.studentLogin(googleUser);
    res.status(200).json(response);
  }
}