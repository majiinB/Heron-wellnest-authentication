import type { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import { AppError } from "../types/appError.type.js";
import { verifyToken } from "../utils/jwt.util.js";


export class LogoutService {
  private refreshTokenRepo: StudentRefreshTokenRepository;

  constructor(refreshTokenRepo: StudentRefreshTokenRepository) {
    this.refreshTokenRepo = refreshTokenRepo;
  }

  public async studentlogout(refreshToken: string): Promise<ApiResponse> {
    // Verify refresh token
    const payload = await verifyToken(refreshToken);

    if (!payload?.sub) {
      throw new AppError(
        400,
        "INVALID_REFRESH_TOKEN",
        "Refresh token payload missing user ID.",
        true
      );
    }

    const storedToken = await this.refreshTokenRepo.findByUserIDAndToken(payload.sub, refreshToken);

    if (!storedToken) {
      throw new AppError(
        401,
        "REFRESH_TOKEN_NOT_FOUND",
        "Refresh token not found or already invalidated.",
        true
      );
    }

    // Delete refresh token (invalidate session)
    await this.refreshTokenRepo.delete(storedToken);

    return {
      success: true,
      code: "LOGOUT_SUCCESS",
      message: "User logged out successfully.",
    };
  }
}