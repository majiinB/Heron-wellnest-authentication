import ms from "ms"
import { env } from "../config/env.config.js";
import { Student } from "../models/student.model.js";
import { StudentRefreshToken } from "../models/studentRefreshToken.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import { Admin } from "../models/admin.model.js";
import { AdminRepository } from "../repository/admin.repository.js";
import { AppError } from "../types/appError.type.js";
import { comparePassword } from "../utils/crypt.util.js";
import { AdminRefreshToken } from "../models/adminRefreshToken.model.js";
import { AdminRefreshTokenRepository } from "../repository/adminRefreshToken.repository.js";

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
  private adminRepository: AdminRepository;
  private studentRefreshTokenRepository: StudentRefreshTokenRepository;
  private adminRefreshTokenRepository: AdminRefreshTokenRepository;

  constructor(userRepository: StudentRepository, adminRepository: AdminRepository, studentRefreshTokenRepository: StudentRefreshTokenRepository, adminRefreshTokenRepository: AdminRefreshTokenRepository) {
    this.userRepository = userRepository;
    this.adminRepository = adminRepository;
    this.studentRefreshTokenRepository = studentRefreshTokenRepository;
    this.adminRefreshTokenRepository = adminRefreshTokenRepository;
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
      college_program: user.college_program?.program_name ?? null,
      college_department: user.college_program?.college_department_id?.department_name ?? null,
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

  public async adminLogin(admin: Admin) : Promise<ApiResponse> {
    const user: Admin | null = await this.adminRepository.findByEmail(admin.email);

    if(!user){
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Credentials provided are incorrect",
        true
      )
    }

    // Validate password
    const isValidPassword = await comparePassword(admin.password, user.password);
    if (!isValidPassword) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Credentials provided are incorrect",
        true
      );
    }

    // Check if a refresh token under the same user id exists
    const existingRefreshToken : AdminRefreshToken | null = await this.adminRefreshTokenRepository.findByUserID(user.user_id);
    if(existingRefreshToken){
      // Delete if refresh token under the user exists
      await this.adminRefreshTokenRepository.delete(existingRefreshToken);
    }

    // User exists, generate tokens
    const payload: AccessTokenClaims = {
      sub: user.user_id,
      role: user.is_super_admin ? "super_admin" : "admin",
      email: user.email,
      name: user.user_name,
    }

    // Generate JWT tokens
    const accessToken: string = await signAccessToken(payload);
    const refreshToken: string = await signRefreshToken(user.user_id);

    // Save refresh token to database
    const ttlString: ms.StringValue = env.JWT_REFRESH_TOKEN_TTL as ms.StringValue || "7d"; 
    const ttlMs = ms(ttlString);
    const expiresAt = new Date(Date.now() + ttlMs);
    const adminRT: AdminRefreshToken = new AdminRefreshToken(); 
    adminRT.admin = user;
    adminRT.token = refreshToken;
    adminRT.expires_at = expiresAt
    await this.adminRefreshTokenRepository.save(adminRT);

    // Prepare response
    const response: ApiResponse = {
      success: true,
      code: "LOGIN_SUCCESS",
      message: "Admin login successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    }

    return response;
  }
}


