import type { EntityManager } from "typeorm";
import { AppDataSource } from "../config/datasource.config.js";
import { StudentRefreshToken } from "../models/studentRefreshToken.model.js";

/**
 * Student Refresh Token Repository
 * 
 * @description Repository class for managing student refresh tokens.
 * Provides methods to query, save, and delete refresh token records
 * in the database using TypeORM.
 * 
 * @file studentRefreshToken.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-04
 * @updated 2025-09-04
 */
export class StudentRefreshTokenRepository {
  private repo = AppDataSource.getRepository(StudentRefreshToken);

  async findByUserIDAndToken(userID: string, token: string): Promise<StudentRefreshToken | null> {
    return this.repo.findOne({
       where: { 
        token: token,
        student: {user_id : userID}
      },
      relations: ["student"]
    });
  }

  async findByUserID(userID: string): Promise<StudentRefreshToken | null> {
    return this.repo.findOne({
      where: {
        student : {user_id: userID}
      }
    })
  }

  async save(token: StudentRefreshToken, manager?: EntityManager): Promise<StudentRefreshToken> {
    if (manager) {
      return manager.save(StudentRefreshToken, token);
    }
    return this.repo.save(token);
  }

  async delete(token: StudentRefreshToken, manager?: EntityManager): Promise<void> {
    if (manager) {
      await manager.remove(StudentRefreshToken, token);
      return;
    }
    await this.repo.remove(token);
  }
}