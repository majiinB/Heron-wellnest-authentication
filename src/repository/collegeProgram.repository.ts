import { AppDataSource } from "../config/datasource.config.js";
import { CollegeProgram } from "../models/collegeProgram.model.js";

/**
 * College Program Repository
 * 
 * @description Repository class for managing college program entities.
 * Provides methods to query, save, update, and delete college program records
 * in the database using TypeORM.
 * 
 * @file collegeProgram.repository.ts
 * 
 * @author Arthur M. Artugue
 * @created 2025-10-16
 * @updated 2025-10-16
 */
export class CollegeProgramRepository {
  private repo = AppDataSource.getRepository(CollegeProgram);

  async findByProgramName(programName: string): Promise<CollegeProgram | null> {
    return this.repo.findOne({ 
      where: { program_name: programName },
      relations: ["college_department_id"] // Ensure department relation is loaded
     });
  }

  async save(program: CollegeProgram): Promise<CollegeProgram> {
    return this.repo.save(program);
  }

  async update(programId: string, fields: Partial<CollegeProgram>): Promise<void> {
    await this.repo.update(programId, fields);
  }


  async findById(programId: string): Promise<CollegeProgram | null> {
    return this.repo.findOne({ where: { program_id: programId } });
  }

  async delete(program: CollegeProgram): Promise<void> {
    await this.repo.remove(program);
  }
}