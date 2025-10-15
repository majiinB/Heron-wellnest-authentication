import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CollegeDepartment } from "./collegeDepartment.model.js";


@Entity("college_programs")
export class CollegeProgram {
  @PrimaryGeneratedColumn("uuid")
  program_id!: string

  @Column({ type: "varchar", length: 255 , nullable: false})
  program_name!: string;

  @ManyToOne(()=> CollegeDepartment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  college_department!: CollegeDepartment | null

  @Column({type: "boolean", default: false})
  is_deleted!: boolean

  @CreateDateColumn({type: "timestamptz"})
  created_at!: Date;

  @UpdateDateColumn({type: "timestamptz"})
  updated_at!: Date;

}