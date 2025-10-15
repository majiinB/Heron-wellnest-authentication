import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.model.js";
import { CollegeDepartment } from "./collegeDepartment.model.js";

/**
 * @file counselor.model.ts
 * 
 * @description Model for `Counselors` in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */
@Entity("counselor")
export class Counselor extends User {
  @Column({ type: "varchar", length: 255 })
  password!: string;

  @OneToOne(() => CollegeDepartment, { nullable: true })
  @JoinColumn({ name: "department_id" })
  college_department!: CollegeDepartment | null;
}