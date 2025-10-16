import { AppDataSource } from "../config/datasource.config.js";
import { Admin } from "../models/admin.model.js";
import type { User } from "../models/user.model.js";

/**
 * Admin Repository
 *
 * @description Repository class for managing admin entities.
 * Provides methods to query, save, update, and delete admin records
 * in the database using TypeORM.
 * 
 * @file admin.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-16
 * @updated 2025-10-16
 */
export class AdminRepository {
  private repo = AppDataSource.getRepository(Admin);

  async findByEmail(email: string): Promise<Admin | null> {
    return this.repo.findOne({ where: { email } });
  }

  async save(user: User): Promise<Admin> {
    return this.repo.save(user);
  }

  async update(user_id: string, fields: Partial<Admin>): Promise<void> {
    await this.repo.update(user_id, fields);
  }

  async findById(user_id: string): Promise<Admin | null> {
    return this.repo.findOne({ where: { user_id } });
  }

  async delete(user: Admin): Promise<void> {
    await this.repo.remove(user);
  }
}