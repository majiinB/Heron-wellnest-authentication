import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Counselor } from "./counselor.model.js";


@Entity("counselor_refresh_tokens")
export class CounselorRefreshToken {
  @PrimaryGeneratedColumn("uuid")
  token_id!: string 

  @ManyToOne(()=> Counselor, {onDelete: "CASCADE"})
  @JoinColumn({name: "user_id"})
  counselor!: Counselor

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