import ms from "ms";
import type { Student } from "../models/student.model.js";
import { StudentRefreshToken } from "../models/studentRefreshToken.model.js";
import type { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import { AppError } from "../types/appError.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import { env } from "../config/env.config.js";
import { AppDataSource } from "../config/datasource.config.js";
import { AdminRefreshToken } from "../models/adminRefreshToken.model.js";
import { CounselorRefreshToken } from "../models/counselorRefreshToken.model.js";
import { AdminRefreshTokenRepository } from "../repository/adminRefreshToken.repository.js";

/**
 * RefreshToken Service
 * 
 * @description Handles verification of refresh tokens and issuing of new access/refresh tokens.
 * 
 * @file refresh-token.service.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-04
 * @updated 2025-10-17
 */
export class RefreshTokenService {
  private studentRefreshTokenRepo: StudentRefreshTokenRepository;
  private adminRefreshTokenRepo: AdminRefreshTokenRepository;
  private counselorRefreshTokeRepo: CounselorRefreshToken;

  constructor(
    studentRefreshTokenRepo: StudentRefreshTokenRepository,
    adminRefreshTokenRepo: AdminRefreshTokenRepository,
    counselorRefreshTokenRepo: CounselorRefreshToken
  ){
    this.studentRefreshTokenRepo = studentRefreshTokenRepo;
    this.adminRefreshTokenRepo = adminRefreshTokenRepo;
    this.counselorRefreshTokeRepo = counselorRefreshTokenRepo;
  }

  public async rotateStudentToken(userId: string, oldRefreshToken: string): Promise<ApiResponse>{
    const storedToken: StudentRefreshToken | null = await this.studentRefreshTokenRepo.findByUserIDAndToken(userId, oldRefreshToken);

    // Check if the refresh token is existing and stored in the database
    if(!storedToken){
      throw new AppError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid or not found",
        true
      );
    }

    // Check if the refresh token is not expired
    if(storedToken.expires_at.getTime() < Date.now()){
      await this.studentRefreshTokenRepo.delete(storedToken);

      throw new AppError(
        401,
        "EXPIRED_REFRESH_TOKEN",
        "Refresh token expired",
        true
      );
    }

    // Check if user referenced exists
    const student: Student | null = storedToken.student;
    if(!student){
      await this.studentRefreshTokenRepo.delete(storedToken);

      throw new AppError(
        404, 
        "USER_NOT_FOUND", 
        "User linked to refresh token not found.", 
        true
      );
    }
    
    // TODO: Provide college program and department in the payload
    // User exists, generate tokens
    const payload: AccessTokenClaims = {
      sub: student.user_id,
      role: student.finished_onboarding ? "student" : "student_pending",
      email: student.email,
      name: student.user_name,
      is_onboarded: student.finished_onboarding,
      college_program: student.college_program?.program_name ?? null,
      college_department: student.college_program?.college_department_id?.department_name ?? null,
    }

    // Generate tokens
    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(student.user_id);

    // Start a transaction
    await AppDataSource.manager.transaction(async (manager) => {
      // Replace old refresh token
      await this.studentRefreshTokenRepo.delete(storedToken, manager);

      // Save new refresh token
      const ttlString: ms.StringValue = env.JWT_REFRESH_TOKEN_TTL as ms.StringValue || "7d"; 
      const ttlMs = ms(ttlString);
      const expiresAt = new Date(Date.now() + ttlMs);
      const studentRT: StudentRefreshToken = new StudentRefreshToken(); 
      studentRT.student = student;
      studentRT.token = newRefreshToken;
      studentRT.expires_at = expiresAt
      await this.studentRefreshTokenRepo.save(studentRT, manager);
    });
    
    // Prepare response
    const response: ApiResponse = {
      success: true,
      code: student.finished_onboarding ? "ACCESS_TOKEN_REFRESS_SUCCESS" : "ACCESS_TOKEN_REFRESH_SUCCESS_ONBOARDING_REQUIRED",
      message: student.finished_onboarding ? 
      "Student access token refresh successful" : 
      "Student access token refresh successful. Onboarding required to complete your profile",
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        is_onboarded: student.finished_onboarding,
      }
    }
    return response;
  }

  public async rotateAdminToken(userId: string, oldRefreshToken: string): Promise<ApiResponse>{
    const storedToken: StudentRefreshToken | null = await this.studentRefreshTokenRepo.findByUserIDAndToken(userId, oldRefreshToken);

    // Check if the refresh token is existing and stored in the database
    if(!storedToken){
      throw new AppError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid or not found",
        true
      );
    }

    // Check if the refresh token is not expired
    if(storedToken.expires_at.getTime() < Date.now()){
      await this.studentRefreshTokenRepo.delete(storedToken);

      throw new AppError(
        401,
        "EXPIRED_REFRESH_TOKEN",
        "Refresh token expired",
        true
      );
    }

    // Check if user referenced exists
    const student: Student | null = storedToken.student;
    if(!student){
      await this.studentRefreshTokenRepo.delete(storedToken);

      throw new AppError(
        404, 
        "USER_NOT_FOUND", 
        "User linked to refresh token not found.", 
        true
      );
    }
    
    // TODO: Provide college program and department in the payload
    // User exists, generate tokens
    const payload: AccessTokenClaims = {
      sub: student.user_id,
      role: student.finished_onboarding ? "student" : "student_pending",
      email: student.email,
      name: student.user_name,
      is_onboarded: student.finished_onboarding,
      college_program: student.college_program?.program_name ?? null,
      college_department: student.college_program?.college_department_id?.department_name ?? null,
    }

    // Generate tokens
    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(student.user_id);

    // Start a transaction
    await AppDataSource.manager.transaction(async (manager) => {
      // Replace old refresh token
      await this.studentRefreshTokenRepo.delete(storedToken, manager);

      // Save new refresh token
      const ttlString: ms.StringValue = env.JWT_REFRESH_TOKEN_TTL as ms.StringValue || "7d"; 
      const ttlMs = ms(ttlString);
      const expiresAt = new Date(Date.now() + ttlMs);
      const studentRT: StudentRefreshToken = new StudentRefreshToken(); 
      studentRT.student = student;
      studentRT.token = newRefreshToken;
      studentRT.expires_at = expiresAt
      await this.studentRefreshTokenRepo.save(studentRT, manager);
    });
    
    // Prepare response
    const response: ApiResponse = {
      success: true,
      code: student.finished_onboarding ? "ACCESS_TOKEN_REFRESS_SUCCESS" : "ACCESS_TOKEN_REFRESH_SUCCESS_ONBOARDING_REQUIRED",
      message: student.finished_onboarding ? 
      "Student access token refresh successful" : 
      "Student access token refresh successful. Onboarding required to complete your profile",
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        is_onboarded: student.finished_onboarding,
      }
    }
    return response;
  }
}