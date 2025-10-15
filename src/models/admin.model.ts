import { Column, Entity } from "typeorm";
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
@Entity("admin")
export class Admin extends User {
  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "boolean", default: false })
  is_super_admin!: boolean;
}