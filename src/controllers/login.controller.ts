import type { NextFunction, Response} from "express";
import type { AuthenticatedRequest } from "../interface/authRequest.interface.js";
import { Student } from "../models/student.model.js";
import type { LoginService } from "../services/login.service.js";
import { AppError } from "../types/appError.type.js";
import { Counselor } from "../models/counselor.model.js";
import { Admin } from "../models/admin.model.js";

/**
 * Login Controller
 * 
 * @description Controller responsible for handling student login requests.
 * It validates Google OAuth user credentials from the request, constructs a
 * Student entity, and delegates the login logic to the LoginService.
 * 
 * @file login.controller.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-02
 * @updated 2025-09-04
 */
export class LoginController {
  private loginService: LoginService;
  
  constructor(loginService: LoginService) {
    this.loginService = loginService;
  }

  /**
   * Handle a student login request authenticated via Google.
   *
   * Extracts `email` and `name` from `req.user`, validates them, and if present:
   * - Constructs a `Student` entity with `email` and `user_name`.
   * - Delegates authentication/creation to `this.loginService.studentLogin`.
   * - Sends the returned payload as a JSON response with HTTP status 200.
   *
   * If `email` or `name` are missing on `req.user`, this method throws an `AppError`
   * with status 400 and code "MISSING_GOOGLE_CREDENTIALS".
   *
   * @param req - AuthenticatedRequest expected to contain a populated `user` object with `email` and `name`.
   * @param res - Express Response used to send the HTTP 200 JSON response.
   * @param _next - Express NextFunction (unused) provided for middleware compatibility.
   * @returns A Promise that resolves when the response has been sent.
   * @throws {AppError} When Google user info (`email` or `name`) is missing (HTTP 400, code "MISSING_GOOGLE_CREDENTIALS").
   * @throws {Error} Any error thrown or rejected by `loginService.studentLogin` will propagate to the caller.
   * @remarks This method performs side effects (sending the HTTP response) and relies on `this.loginService` being available.
   */
  public async handleStudentLogin(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const { email, name } = req.user ?? {};

    if (!email || !name) {
      throw new AppError(
        400,
        "MISSING_GOOGLE_CREDENTIALS",
        "Missing Google user info.",
        true
      ) // Stop execution if missing
    }

    const googleUser = new Student();
    googleUser.email = email;
    googleUser.user_name = name;

    const response = await this.loginService.studentLogin(googleUser);
    res.status(200).json(response);
  }

  /**
   * Handles an administrative login request.
   *
   * Validates that the request body contains both `admin_email` and `admin_password`.
   * If either is missing, an `AppError` with status 400 and code `"MISSING_ADMIN_CREDENTIALS"` is thrown.
   * On success, an `Admin` entity is constructed from the provided credentials and passed to
   * `this.loginService.adminLogin`. The successful login response is returned to the client
   * with HTTP status 200 as JSON.
   *
   * @param req - The authenticated request containing a body with `admin_email` and `admin_password`.
   * @param res - The Express response used to send the HTTP 200 JSON result on success.
   * @param _next - The Express next function (unused).
   * @returns A promise that resolves once the response has been sent.
   * @throws {AppError} Throws when required admin credentials are missing from the request body.
   * @remarks Authentication and token/error handling beyond input validation is delegated to `loginService.adminLogin`.
   */
  public async handleAdminLogin(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const { admin_email, admin_password } = req.body ?? {};

    if (!admin_email || !admin_password) {
      throw new AppError(
        400,
        "MISSING_ADMIN_CREDENTIALS",
        "Missing admin user info.",
        true
      ) // Stop execution if missing
    }

    const admin = new Admin();
    admin.email = admin_email;
    admin.password = admin_password;

    const response = await this.loginService.adminLogin(admin);
    res.status(200).json(response);
  }

  /**
   * Handle counselor login requests.
   *
   * Extracts `counselor_email` and `counselor_password` from the request body, validates their presence,
   * constructs a `Counselor` entity, delegates authentication to `this.loginService.counselorLogin`,
   * and sends the authentication result as a 200 JSON response on success.
   *
   * This method is asynchronous and will throw an `AppError` with status 400 and code "MISSING_ADMIN_CREDENTIALS"
   * if either `counselor_email` or `counselor_password` is not provided in the request body. Any errors
   * thrown by the login service (e.g., invalid credentials, internal errors) are propagated and should be
   * handled by the calling middleware/error handler.
   *
   * @async
   * @param req - AuthenticatedRequest containing `body` with `counselor_email` and `counselor_password`
   * @param res - Express Response used to send the JSON result with HTTP 200 on success
   * @param _next - Express NextFunction (unused) reserved for middleware chaining
   * 
   * @throws {AppError} Throws an AppError(400, "MISSING_ADMIN_CREDENTIALS", ...) when required credentials are missing.
   * @throws {*} Propagates errors from `this.loginService.counselorLogin` (e.g., authentication failures).
   * @returns {Promise<void>} Resolves after sending the JSON response or rejects when an error occurs.
   */
  public async handleCounselorLogin(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const { counselor_email, counselor_password } = req.body ?? {};

    if (!counselor_email || !counselor_password) {
      throw new AppError(
        400,
        "MISSING_ADMIN_CREDENTIALS",
        "Missing admin user info.",
        true
      ) // Stop execution if missing
    }

    const counselor = new Counselor();
    counselor.email = counselor_email;
    counselor.password = counselor_password;

    const response = await this.loginService.counselorLogin(counselor);
    res.status(200).json(response);
  }
  
  /**
   * Handles a unified login request.
   *
   * Extracts `email` and `password` from `req.body`, validates their presence, delegates authentication
   * to `this.loginService.unifiedLogin(email, password)`, and sends the service response as JSON with
   * HTTP status 200.
   *
   * @param req - AuthenticatedRequest containing the credentials in `req.body` (expects `email` and `password`).
   * @param res - Express Response used to send the JSON result back to the client.
   * @param _next - Express NextFunction (unused).
   *
   * @throws {AppError} If `email` or `password` are missing. Thrown with status 400 and code "MISSING_CREDENTIALS".
   * @throws {Error} Any error propagated from `loginService.unifiedLogin`.
   *
   * @returns A promise that resolves when the response has been sent.
   */
  public async handleUnifiedLogin(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      throw new AppError(
        400,
        "MISSING_CREDENTIALS",
        "Email and password are required",
        true
      );
    }

    const response = await this.loginService.unifiedLogin(email, password);
    res.status(200).json(response);
  }
}