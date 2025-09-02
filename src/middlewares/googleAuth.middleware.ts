import type { Response, NextFunction } from "express";
import { AppError } from "../types/appError.type.js";
import { verifyGoogleToken } from "../utils/googleAuth.utils.js";
import type { TokenPayload } from "google-auth-library";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";

/**
 * Express middleware to authenticate requests using Google ID tokens.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * 
 * @returns void
 * @throws AppError if authentication fails
*/
export async function googleAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader : string | undefined = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        401, 
        "AUTH_NO_TOKEN", 
        "No token provided", 
        true
      );
    }

    const token: string = authHeader.split(" ")[1];
    const payload : TokenPayload = await verifyGoogleToken(token);

    // Attach user info to request object
    req.user = {
      sub: payload.sub!,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
    };

    next();
  } catch (error) {
    next(error);
  }
}