import { Student } from "../models/student.model.js";
import type { StudentRepository } from "../repository/student.repository.js";
import type { ApiResponse } from "../types/apiResponse.type.js";
import type { AccessTokenClaims } from "../types/accessTokenClaim.type.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.util.js";
import type { StudentRefreshTokenRepository } from "../repository/studentRefreshToken.repository.js";
import { CollegeProgramRepository } from "../repository/collegeProgram.repository.js";
import ms from "ms";
import { env } from "../config/env.config.js";
import type { CollegeProgram } from "../models/collegeProgram.model.js";
import { AppError } from "../types/appError.type.js";
import { objectExistsInGcs, uploadBufferToGcs } from "../config/cloudStorage.config.js";
import { createHash } from "node:crypto";
import { publishMessage } from "../utils/pubsub.util.js";

type StudentOnboardingPdfInput = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalName?: string;
};

const MAX_ONBOARDING_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function detectPdfMimeType(buffer: Buffer): string | null {
  if (buffer.length < 5) {
    return null;
  }

  // PDF: %PDF-
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return "application/pdf";
  }

  return null;
}

function extensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

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
    
    await this.studentRefreshTokenRepository.upsert(user.user_id, refreshToken, expiresAt);
    
    const response: ApiResponse = {
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

  public async uploadStudentOnboardingPdf(studentID: string, pdfFile: StudentOnboardingPdfInput): Promise<ApiResponse> {
    const user : Student | null = await this.studentRepository.findById(studentID);

    if (!user) {
      throw new AppError(
        404,
        "USER_TO_BE_ONBOARDED_NOT_FOUND",
        `User with ID: ${studentID} was not found`,
        true,
      );
    }

     if(user.finished_onboarding){
      throw new AppError(
        400,
        "USER_ALREADY_ONBOARDED",
        `User ${user.user_name}  is already onboarded.`,
        true
      )
    }

    if (!pdfFile?.buffer || pdfFile.buffer.length === 0) {
      throw new AppError(
        400,
        "PDF_FILE_MISSING",
        "PDF file is required for onboarding.",
        true,
      );
    }

    const pdfSize = pdfFile.size ?? pdfFile.buffer.length;
    if (pdfSize > MAX_ONBOARDING_PDF_SIZE_BYTES) {
      throw new AppError(
        413,
        "PDF_FILE_TOO_LARGE",
        `PDF file must not exceed ${MAX_ONBOARDING_PDF_SIZE_BYTES / (1024 * 1024)}MB.`,
        true,
      );
    }

    if (!pdfFile.mimetype || pdfFile.mimetype !== "application/pdf") {
      throw new AppError(
        400,
        "INVALID_PDF_MIMETYPE",
        "Uploaded file must be a PDF.",
        true,
      );
    }

    const detectedMimeType = detectPdfMimeType(pdfFile.buffer);
    if (!detectedMimeType) {
      throw new AppError(
        400,
        "INVALID_PDF_FILE",
        "Uploaded file is not a valid PDF format.",
        true,
      );
    }

    const pdfHash = createHash("sha256").update(pdfFile.buffer).digest("hex");
    const extension = extensionFromMimeType(detectedMimeType);
    const objectPath = `onboarding/student/${user.user_id}/${pdfHash}.${extension}`;

    const pdfAlreadyUploaded = await objectExistsInGcs(objectPath);
    if (pdfAlreadyUploaded) {
      return {
        success: true,
        code: "ONBOARDING_PDF_ALREADY_UPLOADED",
        message: `This onboarding PDF was already uploaded for user ${user.user_name}.`,
        data: {
          content_type: detectedMimeType,
          size_bytes: pdfSize,
          duplicate: true,
        },
      };
    }

    const gcsUri = await uploadBufferToGcs({
      buffer: pdfFile.buffer,
      destination: objectPath,
      contentType: detectedMimeType,
      metadata: {
        metadata: {
          student_id: user.user_id,
          upload_purpose: "student_onboarding_pdf",
          pdf_hash_sha256: pdfHash,
          source_file_name: pdfFile.originalName ?? "unknown",
        },
      },
    });

    await publishMessage(env.PUBSUB_OCR_TOPIC, {
      eventType: 'PDF_UPLOADED',
      gcsUri: gcsUri,
      userId: user.user_id,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      code: "ONBOARDING_PDF_UPLOADED",
      message: `Onboarding PDF uploaded for user ${user.user_name}.`,
      data: {
        content_type: detectedMimeType,
        size_bytes: pdfSize,
        duplicate: false,
      },
    };
  }
}