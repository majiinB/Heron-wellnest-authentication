import { Student } from "../models/student.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import type { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import { StudentRefreshToken } from "../models/studentRefreshToken.model.js";
import ms from "ms";
import { env } from "../config/env.config.js";

/**
 * OnBoarding Service
 * 
 * @description Service responsible for completing the onboarding process for students.
 * It verifies whether the student exists, checks if onboarding is already completed,
 * updates student information, and generates access/refresh tokens upon success.
 * 
 * @file onBoarding.service.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-02
 * @updated 2025-09-04
 */
export class OnBoardingService {
  private studentRepository: StudentRepository;
  private studentRefreshTokenRepository : StudentRefreshTokenRepository;

  constructor(studentRepository : StudentRepository, studentRefreshTokenRepository: StudentRefreshTokenRepository){
    this.studentRepository = studentRepository;
    this.studentRefreshTokenRepository = studentRefreshTokenRepository;
  }

  public async completeStudentInfo(studentID : string, collegeDepartment: string): Promise<ApiResponse>{
    const user : Student | null = await this.studentRepository.findById(studentID);
    let response : ApiResponse;

    if(!user){
      return response = {
        success: false,
        code: "USER_TO_BE_ONBOARDED_NOT_FOUND",
        message: `User with ID: ${studentID}  was not found`
      }
    }

    if(user.finished_onboarding){
      return response = {
        success: false,
        code: "USER_ALREADY_ONBOARDED",
        message: `User ${user.user_name}  is already onboarded.`
      }
    }
    
    await this.studentRepository.update(studentID, {
      college_department: collegeDepartment,
      finished_onboarding: true,
      updated_at: new Date(),
    });

    // Check if a refresh token under the same user id exists
    const existingRefreshToken : StudentRefreshToken | null = await this.studentRefreshTokenRepository.findByUserID(user.user_id);
    if(existingRefreshToken){
      // Delete if refresh token under the user exists
      await this.studentRefreshTokenRepository.delete(existingRefreshToken);
    }

    const payload: AccessTokenClaims = {
      sub: user.user_id,
      role: "student",
      email: user.email,
      name: user.user_name,
      is_onboarded: true,
      college_department: collegeDepartment,
    }

    // Generate JWT tokens
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(user.user_id);

    // Save/Replace refresh token to database
    const ttlString: ms.StringValue = env.JWT_REFRESH_TOKEN_TTL as ms.StringValue || "7d"; 
    const ttlMs = ms(ttlString);
    const expiresAt = new Date(Date.now() + ttlMs);
    const studentRT: StudentRefreshToken = new StudentRefreshToken(); 
    studentRT.student = user;
    studentRT.token = refreshToken;
    studentRT.expires_at = expiresAt
    await this.studentRefreshTokenRepository.save(studentRT);
    
    response = {
        success: true,
        code: "USER_SUCESSFULLY_ONBOARDED",
        message: `User ${user.user_name} sucessfully onboarded`,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          is_onboarded: true,
        }
      }
    return response;
  }
}