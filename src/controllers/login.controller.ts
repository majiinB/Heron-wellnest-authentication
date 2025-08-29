import type { NextFunction, Response} from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import { Student } from "../models/student.model.js";
import type { LoginService } from "../services/login.service.js";

export class LoginController {
  private loginService: LoginService;
  
  constructor(loginService: LoginService) {
    this.loginService = loginService;
  }

  public async handleStudentLogin(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
  try {
    const { email, name } = req.user ?? {};

    if (!email || !name) {
      res.status(400).json({ message: "Missing Google user info" });
      return; // Stop execution if missing
    }

    const googleUser = new Student();
    googleUser.email = email;
    googleUser.user_name = name;

    const user = await this.loginService.studentLogin(googleUser);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

}