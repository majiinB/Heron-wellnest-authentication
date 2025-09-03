import { AppDataSource } from "../config/datasource.config.js";
import { Student } from "../models/student.model.js";
import type { User } from "../models/user.model.js";

/**
 * Student Repository
 * 
 * @description Repository class for managing student entities.
 * Provides methods to query, save, update, and delete student records
 * in the database using TypeORM.
 * 
 * @file student.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-09-02
 * @updated 2025-09-04
 */
export class StudentRepository {
  private repo = AppDataSource.getRepository(Student);

  async findByEmail(email: string): Promise<Student | null> {
    return this.repo.findOne({ where: { email } });
  }

  async save(user: User): Promise<Student> {
    return this.repo.save(user);
  }

  async update(user_id: string, fields: Partial<Student>): Promise<void> {
    await this.repo.update(user_id, fields);
  }


  async findById(user_id: string): Promise<Student | null> {
    return this.repo.findOne({ where: { user_id } });
  }

  async delete(user: Student): Promise<void> {
    await this.repo.remove(user);
  }
}