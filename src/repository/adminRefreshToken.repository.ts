import type { EntityManager } from "typeorm";
import { AppDataSource } from "../config/datasource.config.js";
import { AdminRefreshToken } from "../models/adminRefreshToken.model.js";

/**
 * Admin Refresh Token Repository
 *
 * @description Repository class for managing admin refresh tokens.
 *
 * Provides methods to query, save, and delete refresh token records
 * in the database using TypeORM.
 * 
 * @file adminRefreshToken.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-16
 * @updated 2025-10-16
 */
export class AdminRefreshTokenRepository {
  private repo = AppDataSource.getRepository(AdminRefreshToken);

  async findByUserIDAndToken(userID: string, token: string): Promise<AdminRefreshToken | null> {
    return this.repo.findOne({
       where: { 
        token: token,
        admin: {user_id : userID}
      },
      relations: ["admin"]
    });
  }

  async findByUserID(userID: string): Promise<AdminRefreshToken | null> {
    return this.repo.findOne({
      where: {
        admin : {user_id: userID}
      }
    })
  }

  async save(token: AdminRefreshToken, manager?: EntityManager): Promise<AdminRefreshToken> {
    if (manager) {
      return manager.save(AdminRefreshToken, token);
    }
    return this.repo.save(token);
  }

  async delete(token: AdminRefreshToken, manager?: EntityManager): Promise<void> {
    if (manager) {
      await manager.remove(AdminRefreshToken, token);
      return;
    }
    await this.repo.remove(token);
  }
}