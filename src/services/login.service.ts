import ms from "ms"
import { env } from "../config/env.config.js";
import { Student } from "../models/student.model.js";
import { StudentRefreshToken } from "../models/studentRefreshToken.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
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
 * @updated 2025-09-04
 */
export class LoginService {
  private userRepository: StudentRepository;
  private studentRefreshTokenRepository: StudentRefreshTokenRepository

  constructor(userRepository: StudentRepository, studentRefreshTokenRepository: StudentRefreshTokenRepository) {
    this.userRepository = userRepository;
    this.studentRefreshTokenRepository = studentRefreshTokenRepository;
  }

  public async studentLogin(googleUser: Student) : Promise<ApiResponse> {
    let user: Student | null = await this.userRepository.findByEmail(googleUser.email);

    // Check if user exists in the database
    if (!user) {
      // User does not exist, create a new user
      const newUser: Student = new Student();
      newUser.email = googleUser.email;
      newUser.user_name = googleUser.user_name;
      newUser.college_program = null;
      newUser.finished_onboarding = false;

      user = await this.userRepository.save(newUser);
    }

    // Check if a refresh token under the same user id exists
    const existingRefreshToken : StudentRefreshToken | null = await this.studentRefreshTokenRepository.findByUserID(user.user_id);
    if(existingRefreshToken){
      // Delete if refresh token under the user exists
      await this.studentRefreshTokenRepository.delete(existingRefreshToken);
    }

    // User exists or has been created, generate tokens
    const payload: AccessTokenClaims = {
      sub: user.user_id,
      role: user.finished_onboarding ? "student" : "student_pending",
      email: user.email,
      name: user.user_name,
      is_onboarded: user.finished_onboarding,
      college_program: user.college_program ?? null,
    }

    // Generate JWT tokens
    const accessToken: string = await signAccessToken(payload);
    const refreshToken: string = await signRefreshToken(user.user_id);

    // Save refresh token to database
    const ttlString: ms.StringValue = env.JWT_REFRESH_TOKEN_TTL as ms.StringValue || "7d"; 
    const ttlMs = ms(ttlString);
    const expiresAt = new Date(Date.now() + ttlMs);
    const studentRT: StudentRefreshToken = new StudentRefreshToken(); 
    studentRT.student = user;
    studentRT.token = refreshToken;
    studentRT.expires_at = expiresAt
    await this.studentRefreshTokenRepository.save(studentRT);

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

