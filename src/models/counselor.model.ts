import { ChildEntity, Column } from "typeorm";
import { User } from "./user.model.js";

/**
 * @file counselor.model.ts
 * 
 * @description Model for `Counselors` in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */
@ChildEntity("counselor")
export class Counselor extends User {

  @Column({ type: "varchar", length: 255 })
  college_department!: string;
}