import { AppDataSource } from "../config/datasource.config.js";
import { Counselor } from "../models/counselor.model.js";
import type { User } from "../models/user.model.js";

/**
 * Counselor Repository
 * 
 * @description Repository class for managing counselor entities.
 * Provides methods to query, save, update, and delete counselor records
 * in the database using TypeORM.
 * 
 * @file counselor.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-16
 * @updated 2025-10-16
 */
export class CounselorRepository {
  private repo = AppDataSource.getRepository(Counselor);

  async findByEmail(email: string): Promise<Counselor | null> {
    return this.repo.findOne({ where: { email } });
  }

  async save(user: User): Promise<Counselor> {
    return this.repo.save(user);
  }

  async update(user_id: string, fields: Partial<Counselor>): Promise<void> {
    await this.repo.update(user_id, fields);
  }

  async findById(user_id: string): Promise<Counselor | null> {
    return this.repo.findOne({ where: { user_id } });
  }

  async delete(user: Counselor): Promise<void> {
    await this.repo.remove(user);
  }
}