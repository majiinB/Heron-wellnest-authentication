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

type StudentOnboardingImageInput = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalName?: string;
};

const MAX_ONBOARDING_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function detectImageMimeType(buffer: Buffer): string | null {
  if (buffer.length < 12) {
    return null;
  }

  // JPEG FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // GIF87a / GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
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

  public async uploadStudentOnboardingImage(studentID: string, imageFile: StudentOnboardingImageInput): Promise<ApiResponse> {
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

    if (!imageFile?.buffer || imageFile.buffer.length === 0) {
      throw new AppError(
        400,
        "IMAGE_FILE_MISSING",
        "Image file is required for onboarding.",
        true,
      );
    }

    const imageSize = imageFile.size ?? imageFile.buffer.length;
    if (imageSize > MAX_ONBOARDING_IMAGE_SIZE_BYTES) {
      throw new AppError(
        413,
        "IMAGE_FILE_TOO_LARGE",
        `Image file must not exceed ${MAX_ONBOARDING_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`,
        true,
      );
    }

    if (!imageFile.mimetype || !imageFile.mimetype.startsWith("image/")) {
      throw new AppError(
        400,
        "INVALID_IMAGE_MIMETYPE",
        "Uploaded file must be an image.",
        true,
      );
    }

    const detectedMimeType = detectImageMimeType(imageFile.buffer);
    if (!detectedMimeType) {
      throw new AppError(
        400,
        "INVALID_IMAGE_FILE",
        "Uploaded file is not a supported image format.",
        true,
      );
    }

    const imageHash = createHash("sha256").update(imageFile.buffer).digest("hex");
    const extension = extensionFromMimeType(detectedMimeType);
    const objectPath = `onboarding/student/${user.user_id}/${imageHash}.${extension}`;

    const imageAlreadyUploaded = await objectExistsInGcs(objectPath);
    if (imageAlreadyUploaded) {
      return {
        success: true,
        code: "ONBOARDING_IMAGE_ALREADY_UPLOADED",
        message: `This onboarding image was already uploaded for user ${user.user_name}.`,
        data: {
          content_type: detectedMimeType,
          size_bytes: imageSize,
          duplicate: true,
        },
      };
    }

    const gcsUri = await uploadBufferToGcs({
      buffer: imageFile.buffer,
      destination: objectPath,
      contentType: detectedMimeType,
      metadata: {
        metadata: {
          student_id: user.user_id,
          upload_purpose: "student_onboarding_image",
          image_hash_sha256: imageHash,
          source_file_name: imageFile.originalName ?? "unknown",
        },
      },
    });

    await publishMessage(env.PUBSUB_OCR_TOPIC, {
      eventType: 'JOURNAL_ENTRY_UPDATED',
      gcsUri: gcsUri,
      userId: user.user_id,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      code: "ONBOARDING_IMAGE_UPLOADED",
      message: `Onboarding image uploaded for user ${user.user_name}.`,
      data: {
        content_type: detectedMimeType,
        size_bytes: imageSize,
        duplicate: false,
      },
    };
  }
}