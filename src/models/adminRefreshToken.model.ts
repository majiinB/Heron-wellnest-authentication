import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Admin } from "./admin.model.js";


@Entity("admin_refresh_tokens")
export class AdminRefreshToken {
  @PrimaryGeneratedColumn("uuid")
  token_id!: string 

  @Index({unique: true})
  @ManyToOne(()=> Admin, {onDelete: "CASCADE"})
  @JoinColumn({name: "user_id"})
  admin!: Admin

  @Index({unique: true})
  @Column({type: "text"})
  token!: string

  @Column({type: "timestamptz"})
  expires_at!: Date;

  @CreateDateColumn({type: "timestamptz"})
  created_at!: Date;

  @UpdateDateColumn({type: "timestamptz"})
  updated_at!: Date;

}