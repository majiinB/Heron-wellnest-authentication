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
      relations: ["student", 'student.college_program',
        'student.college_program.college_department_id']
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

  async upsert(userID: string, token: string, expiresAt: Date, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(StudentRefreshToken) : this.repo;
    
    await repo.upsert(
      {
        student: { user_id: userID },
        token: token,
        expires_at: expiresAt
      },
      {
        conflictPaths: ['student'], // matches your unique constraint
        skipUpdateIfNoValuesChanged: false
      }
    );
  }

  async deleteByUserID(userID: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(StudentRefreshToken) : this.repo;
    await repo.delete({ student: { user_id: userID } });
  }

  async delete(token: StudentRefreshToken, manager?: EntityManager): Promise<void> {
    if (manager) {
      await manager.remove(StudentRefreshToken, token);
      return;
    }
    await this.repo.remove(token);
  }
}