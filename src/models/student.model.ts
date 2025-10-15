import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.model.js";
import { CollegeProgram } from "./collegeProgram.model.js";

/**
 * @file student.model.ts
 * 
 * @description Model for `Students` in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-10-16
 */
@Entity("student")
export class Student extends User {
  @ManyToOne(() => CollegeProgram,{ onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: "program_id" })
  college_program!: CollegeProgram | null;

  @Column({ type: "boolean", default: false })
  finished_onboarding!: boolean;
}