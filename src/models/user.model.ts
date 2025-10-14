import { Column, CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

export abstract class User implements IUser {
  @PrimaryGeneratedColumn("uuid")
  user_id!: string;

  @Column({type: "varchar", length: 255, nullable: false})
  user_name!: string;

  @Index({unique: true})
  @Column({type: "varchar", length: 255, nullable: false})
  email!: string;

  @Column({ type: "boolean", default: false })
  is_deleted!: boolean;

  @CreateDateColumn({type: "timestamptz"})
  created_at!: Date;

  @UpdateDateColumn({type: "timestamptz"})
  updated_at!: Date;
}