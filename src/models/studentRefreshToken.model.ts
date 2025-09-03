import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Student } from "./student.model.js";


@Entity("student_refresh_tokens")
export class StudentRefreshToken {
  @PrimaryGeneratedColumn("uuid")
  token_id!: string 

  @ManyToOne(()=> Student, {onDelete: "CASCADE"})
  @JoinColumn({name: "user_id"})
  student!: Student

  @Index({unique: true})
  @Column({type: "text"})
  token!: string

  @Column({type: "datetime"})
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

}