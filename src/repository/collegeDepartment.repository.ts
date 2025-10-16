import { AppDataSource } from "../config/datasource.config.js";
import { CollegeDepartment } from "../models/collegeDepartment.model.js";
import type { User } from "../models/user.model.js";

/**
 * College Department Repository
 * 
 * @description Repository class for managing college department entities.
 * Provides methods to query, save, update, and delete college department records
 * in the database using TypeORM.
 * 
 * @file collegeDepartment.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-16
 * @updated 2025-10-16
 */
export class CollegeDepartmentRepository {
  private repo = AppDataSource.getRepository(CollegeDepartment);

  async findByDepartmentName(departmentName: string): Promise<CollegeDepartment | null> {
    return this.repo.findOne({ where: { department_name: departmentName } });
  }

  async save(department: CollegeDepartment): Promise<CollegeDepartment> {
    return this.repo.save(department);
  }

  async update(departmentId: string, fields: Partial<CollegeDepartment>): Promise<void> {
    await this.repo.update(departmentId, fields);
  }


  async findById(departmentId: string): Promise<CollegeDepartment | null> {
    return this.repo.findOne({ where: { department_id: departmentId } });
  }

  async delete(department: CollegeDepartment): Promise<void> {
    await this.repo.remove(department);
  }
}