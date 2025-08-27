import { ChildEntity, Column } from "typeorm";
import { User } from "./user.model.js";

/**
 * @file student.model.ts
 * 
 * @description Model for `Students` in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */
@ChildEntity("student")
export class Student extends User {
  @Column({ type: "int" })
  year_level!: number;

  @Column({ type: "varchar", length: 255 })
  college_department!: string;

  @Column({ type: "boolean", default: false })
  finished_onboarding!: boolean;
}