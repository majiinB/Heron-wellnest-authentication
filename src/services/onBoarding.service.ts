import { Student } from "../models/student.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";

export class OnBoardingService {
  private userRepository: StudentRepository;

  constructor(userRepository : StudentRepository){
    this.userRepository = userRepository;
  }

  public async completeStudentInfo(studentID : string, collegeDepartment: string): Promise<ApiResponse>{
    const user : Student | null = await this.userRepository.findById(studentID);
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
    

    await this.userRepository.update(studentID, {
      college_department: collegeDepartment,
      finished_onboarding: true,
      updated_at: new Date(),
    });

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