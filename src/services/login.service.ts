import { Student } from "../models/student.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";

/**
 * Login Service
 * 
 * @description Service to handle login operations for students.
 * 
 * @file login.service.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-02
 * @updated 2025-09-02
 */
export class LoginService {
  private userRepository: StudentRepository;

  constructor(userRepository: StudentRepository) {
    this.userRepository = userRepository;
  }

  public async studentLogin(googleUser: Student) : Promise<ApiResponse> {
    let user: Student | null = await this.userRepository.findByEmail(googleUser.email);

    // Check if user exists in the database
    if (!user) {
      // User does not exist, create a new user
      const newUser: Student = new Student();
      newUser.email = googleUser.email;
      newUser.user_name = googleUser.user_name;
      newUser.college_department = null;
      newUser.finished_onboarding = false;

      user = await this.userRepository.save(newUser);
    }

    // User exists or has been created, generate tokens
    const payload: AccessTokenClaims = {
      sub: user.user_id,
      role: user.finished_onboarding ? "student" : "student_pending",
      email: user.email,
      name: user.user_name,
      is_onboarded: user.finished_onboarding,
      college_department: user.college_department ?? null,
    }

    // Generate JWT tokens
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(user.user_id);

    // Prepare response
    const response: ApiResponse = {
      success: true,
      code: user.finished_onboarding ? "LOGIN_SUCCESS" : "ONBOARDING_REQUIRED",
      message: user.finished_onboarding ? 
      "Student login successful" : 
      "Onboarding required to complete your profile",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        is_onboarded: user.finished_onboarding,
      }
    }

    return response;
  }
}

