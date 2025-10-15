import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CollegeDepartment } from "./collegeDepartment.model.js";


@Entity("college_programs")
export class CollegeProgram {
  @PrimaryGeneratedColumn("uuid")
  program_id!: string

  @Column({ type: "varchar", length: 255 , nullable: false})
  program_name!: string;

  @OneToOne(()=> CollegeDepartment, {onDelete: "CASCADE"})
  @JoinColumn({name: "department_id"})
  college_department!: CollegeDepartment

  @Column({type: "boolean", default: false})
  is_deleted!: boolean

  @CreateDateColumn({type: "timestamptz"})
  created_at!: Date;

  @UpdateDateColumn({type: "timestamptz"})
  updated_at!: Date;

}