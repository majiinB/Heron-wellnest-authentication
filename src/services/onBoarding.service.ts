import { Student } from "../models/student.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import type { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import { StudentRefreshToken } from "../models/studentRefreshToken.model.js";
import { CollegeProgramRepository } from "../repository/collegeProgram.repository.js";
import ms from "ms";
import { env } from "../config/env.config.js";
import type { CollegeProgram } from "../models/collegeProgram.model.js";
import { AppError } from "../types/appError.type.js";

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
  private collegeProgramRepository: CollegeProgramRepository;
  private studentRefreshTokenRepository : StudentRefreshTokenRepository;

  constructor(studentRepository : StudentRepository, studentRefreshTokenRepository: StudentRefreshTokenRepository, collegeProgramRepository: CollegeProgramRepository){
    this.studentRepository = studentRepository;
    this.studentRefreshTokenRepository = studentRefreshTokenRepository;
    this.collegeProgramRepository = collegeProgramRepository;
  }

  public async completeStudentInfo(studentID : string, collegeProgram: string): Promise<ApiResponse>{
    const user : Student | null = await this.studentRepository.findById(studentID);
    let response : ApiResponse;

    if(!user){
      throw new AppError(
        404,
        "USER_TO_BE_ONBOARDED_NOT_FOUND",
        `User with ID: ${studentID}  was not found`,
        true
      )
    }

    if(user.finished_onboarding){
      throw new AppError(
        400,
        "USER_ALREADY_ONBOARDED",
        `User ${user.user_name}  is already onboarded.`,
        true
      )
    }
    
    // Validate if the provided college program exists in the CollegeProgram table
    const cleanProgramName = collegeProgram.trim();
    const collegeProgramEntity : CollegeProgram | null = await this.collegeProgramRepository.findByProgramName(cleanProgramName);
    if(!collegeProgramEntity){
      throw new AppError(
        404,
        "COLLEGE_PROGRAM_NOT_FOUND",
        `College program ${collegeProgram} was not found`,
        true
      )
    }

    // If valid, proceed to update the student's college program and mark onboarding as finished
    user.college_program = collegeProgramEntity;
    await this.studentRepository.update(studentID, {
      college_program: collegeProgramEntity,
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
      college_program: collegeProgramEntity.program_name,
      college_department: collegeProgramEntity.college_department_id?.department_name ?? null,
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