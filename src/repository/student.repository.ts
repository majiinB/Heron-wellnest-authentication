import { AppDataSource } from "../config/datasource.config.js";
import { Student } from "../models/student.model.js";
import type { User } from "../models/user.model.js";

export class StudentRepository {
  private repo = AppDataSource.getRepository(Student);

  async findByEmail(email: string): Promise<Student | null> {
    return this.repo.findOne({ where: { email } });
  }

  async save(user: User): Promise<Student> {
    return this.repo.save(user);
  }

  async findById(user_id: string): Promise<Student | null> {
    return this.repo.findOne({ where: { user_id } });
  }

  async delete(user: Student): Promise<void> {
    await this.repo.remove(user);
  }
}