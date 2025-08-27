import { ChildEntity, Column } from "typeorm";
import type { StudentUser } from "../interface/user.interface.js";
import { User } from "./user.model.js";

/**
 * @file student.model.ts
 * 
 * @description Model for Student in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */
@ChildEntity("student")
export class Student extends User implements StudentUser {
  readonly role: "student" = "student";  // not a column, just a TS contract

  @Column({ type: "int" })
  year_level!: number;

  @Column({ type: "varchar", length: 255 })
  college_department!: string;
}