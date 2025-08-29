import { Entity, Column } from "typeorm";
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
@Entity("students")
export class Student extends User {
  @Column({ type: "int", nullable: true })
  year_level!: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  college_department!: string | null;

  @Column({ type: "boolean", default: false })
  finished_onboarding!: boolean;
}