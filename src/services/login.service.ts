import { Student } from "../models/student.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";

export class LoginService {
  private userRepository: StudentRepository;

  constructor(userRepository: StudentRepository) {
    this.userRepository = userRepository;
  }

  public async studentLogin(googleUser: Student) : Promise<ApiResponse> {
    let user: Student | null = await this.userRepository.findByEmail(googleUser.email);

    if (!user) {
      // User does not exist, create a new user
      const newUser: Student = new Student();
      newUser.email = googleUser.email;
      newUser.user_name = googleUser.user_name;
      newUser.year_level = null;
      newUser.college_department = null;
      newUser.finished_onboarding = false;

      user = await this.userRepository.save(newUser);
    }

    const payload: AccessTokenClaims =  {
      role: "student",
      sub: user.user_id,
      email: user.email,
      name: user.user_name,
    }
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(user.user_id);

    const response: ApiResponse = {
      success: true,
      code: "LOGIN_SUCCESS",
      message: "Student login successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    }

    return response;
  }
}

