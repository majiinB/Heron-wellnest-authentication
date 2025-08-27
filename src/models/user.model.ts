import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";
import type { IUser } from "../interface/user.interface.js";

/**
 * @file user.model.ts
 * 
 * @description `Abstract` base model for `User` in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */
@Entity({ name: "users" })
@TableInheritance({ column: { type: "varchar", name: "role" } })
export abstract class User implements IUser {
  @PrimaryGeneratedColumn("uuid")
  user_id!: string;

  @Column({type: "varchar", length: 255})
  user_name!: string;

  @Column({type: "varchar", length: 255, unique: true})
  email!: string;

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

}