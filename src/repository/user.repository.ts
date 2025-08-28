import { AppDataSource } from "../config/datasource.config.js";
import { User } from "../models/user.model.js";

export class UserRepository {
  private repo = AppDataSource.getRepository(User);

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async findById(user_id: string): Promise<User | null> {
    return this.repo.findOne({ where: { user_id } });
  }

  async delete(user: User): Promise<void> {
    await this.repo.remove(user);
  }
}